#!/usr/bin/env python3
"""Download economic series from FRED (no API key needed) into static/markets/data/fred/.

Run by the GitHub Actions workflow before every build (and on a schedule), so the
Markets > Economic indicators page always has fresh data. Safe to run locally too:
    python3 scripts/fetch_market_data.py
A series that fails to download is skipped; the page simply won't list it.
"""
import csv, io, json, os, sys, time, datetime, urllib.request, urllib.error

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'markets', 'data', 'fred')

# id, title, units, category, frequency (D/W/M/Q), note
SERIES = [
    # Manufacturing & business surveys (regional Fed surveys are free PMI-style diffusion indexes)
    ('GACDFSA066MSFRBPHI', 'Philadelphia Fed Manufacturing: Current Activity', 'Diffusion index', 'Manufacturing & surveys', 'M', 'Share of firms reporting increases minus decreases. Above 0 = expanding. Since 1968.'),
    ('GACDISA066MSFRBNY', 'Empire State (NY Fed) Manufacturing: General Business Conditions', 'Diffusion index', 'Manufacturing & surveys', 'M', 'Above 0 = expanding. Since 2001.'),
    ('CFNAI', 'Chicago Fed National Activity Index', 'Index (0 = trend growth)', 'Manufacturing & surveys', 'M', 'Weighted average of 85 activity indicators. Below −0.7 has usually signaled recession.'),
    ('INDPRO', 'Industrial Production Index', 'Index 2017=100', 'Manufacturing & surveys', 'M', ''),
    ('IPMAN', 'Industrial Production: Manufacturing', 'Index 2017=100', 'Manufacturing & surveys', 'M', ''),
    ('TCU', 'Capacity Utilization: Total Industry', 'Percent', 'Manufacturing & surveys', 'M', ''),
    ('DGORDER', 'Durable Goods Orders', 'Millions of $', 'Manufacturing & surveys', 'M', ''),
    # Growth
    ('GDPC1', 'Real GDP', 'Billions of chained 2017 $', 'Growth', 'Q', ''),
    ('A191RL1Q225SBEA', 'Real GDP Growth (quarterly, annualized)', 'Percent', 'Growth', 'Q', ''),
    ('GDPNOW', 'Atlanta Fed GDPNow (current-quarter nowcast)', 'Percent', 'Growth', 'Q', ''),
    ('USREC', 'NBER Recession Indicator', '1 = recession', 'Growth', 'M', 'Used for the gray recession bars.'),
    ('SAHMREALTIME', 'Sahm Rule Recession Indicator (real time)', 'Percentage points', 'Growth', 'M', 'Signals recession at 0.50 or above.'),
    # Labor
    ('UNRATE', 'Unemployment Rate', 'Percent', 'Labor', 'M', ''),
    ('U6RATE', 'U-6 Unemployment Rate (broad)', 'Percent', 'Labor', 'M', ''),
    ('PAYEMS', 'Nonfarm Payrolls', 'Thousands of persons', 'Labor', 'M', 'Use “Change” to see the monthly jobs number.'),
    ('ICSA', 'Initial Jobless Claims', 'Number', 'Labor', 'W', ''),
    ('CCSA', 'Continuing Jobless Claims', 'Number', 'Labor', 'W', ''),
    ('JTSJOL', 'JOLTS Job Openings', 'Thousands', 'Labor', 'M', ''),
    ('CIVPART', 'Labor Force Participation Rate', 'Percent', 'Labor', 'M', ''),
    ('CES0500000003', 'Average Hourly Earnings, Private', '$ per hour', 'Labor', 'M', 'Use “YoY %” for wage growth.'),
    # Inflation
    ('CPIAUCSL', 'CPI: All Items', 'Index 1982-84=100', 'Inflation', 'M', 'Use “YoY %” for the headline inflation rate.'),
    ('CPILFESL', 'Core CPI (ex food & energy)', 'Index 1982-84=100', 'Inflation', 'M', 'Use “YoY %”.'),
    ('PCEPI', 'PCE Price Index', 'Index 2017=100', 'Inflation', 'M', 'Use “YoY %”.'),
    ('PCEPILFE', 'Core PCE Price Index (the Fed’s target gauge)', 'Index 2017=100', 'Inflation', 'M', 'Use “YoY %”; the Fed targets 2%.'),
    ('PPIFIS', 'PPI: Final Demand', 'Index Nov 2009=100', 'Inflation', 'M', 'Use “YoY %”.'),
    ('MICH', 'UMich 1-Year Inflation Expectations', 'Percent', 'Inflation', 'M', ''),
    ('T5YIE', '5-Year Breakeven Inflation', 'Percent', 'Inflation', 'D', ''),
    ('T10YIE', '10-Year Breakeven Inflation', 'Percent', 'Inflation', 'D', ''),
    ('T5YIFR', '5-Year, 5-Year Forward Inflation Expectation', 'Percent', 'Inflation', 'D', ''),
    # Consumer
    ('UMCSENT', 'University of Michigan Consumer Sentiment', 'Index 1966:Q1=100', 'Consumer', 'M', 'The UMCSI.'),
    ('RSAFS', 'Retail Sales', 'Millions of $', 'Consumer', 'M', 'Use “MoM %”.'),
    ('PCEC96', 'Real Personal Consumption Expenditures', 'Billions of chained 2017 $', 'Consumer', 'M', ''),
    ('PSAVERT', 'Personal Saving Rate', 'Percent', 'Consumer', 'M', ''),
    ('TOTALSL', 'Consumer Credit Outstanding', 'Billions of $', 'Consumer', 'M', ''),
    ('DRCCLACBS', 'Credit Card Delinquency Rate', 'Percent', 'Consumer', 'Q', ''),
    # Housing
    ('HOUST', 'Housing Starts', 'Thousands of units (annual rate)', 'Housing', 'M', ''),
    ('PERMIT', 'Building Permits', 'Thousands of units (annual rate)', 'Housing', 'M', ''),
    ('HSN1F', 'New Home Sales', 'Thousands (annual rate)', 'Housing', 'M', ''),
    ('CSUSHPINSA', 'Case-Shiller U.S. National Home Price Index', 'Index Jan 2000=100', 'Housing', 'M', 'Use “YoY %”.'),
    ('MSPUS', 'Median Sales Price of Houses Sold', '$', 'Housing', 'Q', ''),
    ('MORTGAGE30US', '30-Year Fixed Mortgage Rate', 'Percent', 'Housing', 'W', ''),
    # Rates
    ('DFF', 'Effective Federal Funds Rate (daily)', 'Percent', 'Rates', 'D', ''),
    ('FEDFUNDS', 'Effective Federal Funds Rate (monthly)', 'Percent', 'Rates', 'M', ''),
    ('SOFR', 'SOFR', 'Percent', 'Rates', 'D', ''),
    ('DGS1MO', '1-Month Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS3MO', '3-Month Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS6MO', '6-Month Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS1', '1-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS2', '2-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS3', '3-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS5', '5-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS7', '7-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS10', '10-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS20', '20-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DGS30', '30-Year Treasury', 'Percent', 'Rates', 'D', ''),
    ('DFII10', '10-Year TIPS (real yield)', 'Percent', 'Rates', 'D', ''),
    ('T10Y2Y', '10-Year minus 2-Year Treasury Spread', 'Percentage points', 'Rates', 'D', 'Below 0 = inverted curve.'),
    ('T10Y3M', '10-Year minus 3-Month Treasury Spread', 'Percentage points', 'Rates', 'D', 'Below 0 = inverted curve.'),
    # Credit & financial conditions
    ('BAMLH0A0HYM2', 'High-Yield Bond Spread (ICE BofA)', 'Percentage points', 'Credit & conditions', 'D', 'FRED carries only recent years of ICE data.'),
    ('BAMLC0A0CM', 'Investment-Grade Bond Spread (ICE BofA)', 'Percentage points', 'Credit & conditions', 'D', 'FRED carries only recent years of ICE data.'),
    ('NFCI', 'Chicago Fed National Financial Conditions Index', 'Index (0 = average)', 'Credit & conditions', 'W', 'Above 0 = tighter than average.'),
    ('STLFSI4', 'St. Louis Fed Financial Stress Index', 'Index (0 = normal)', 'Credit & conditions', 'W', ''),
    # Money & the Fed
    ('M2SL', 'M2 Money Supply', 'Billions of $', 'Money & the Fed', 'M', 'Use “YoY %”.'),
    ('WALCL', 'Fed Balance Sheet (Total Assets)', 'Millions of $', 'Money & the Fed', 'W', ''),
    ('RRPONTSYD', 'Overnight Reverse Repo (ON RRP)', 'Billions of $', 'Money & the Fed', 'D', ''),
    ('WRESBAL', 'Bank Reserves at the Fed', 'Billions of $', 'Money & the Fed', 'W', ''),
    # Markets
    ('VIXCLS', 'VIX (CBOE Volatility Index), close', 'Index', 'Markets', 'D', 'Daily since 1990.'),
    ('SP500', 'S&P 500 Index', 'Index', 'Markets', 'D', 'FRED carries the last 10 years.'),
    ('NASDAQCOM', 'NASDAQ Composite', 'Index', 'Markets', 'D', ''),
    ('DCOILWTICO', 'WTI Crude Oil', '$ per barrel', 'Markets', 'D', ''),
    ('DCOILBRENTEU', 'Brent Crude Oil', '$ per barrel', 'Markets', 'D', ''),
    ('DHHNGSP', 'Henry Hub Natural Gas', '$ per MMBtu', 'Markets', 'D', ''),
    ('CBBTCUSD', 'Bitcoin (Coinbase), USD', '$', 'Markets', 'D', 'Daily since Dec 2014.'),
    ('DTWEXBGS', 'Trade-Weighted U.S. Dollar Index (Broad)', 'Index Jan 2006=100', 'Markets', 'D', ''),
    ('DEXUSEU', 'EUR/USD', 'US$ per euro', 'Markets', 'D', ''),
    ('DEXJPUS', 'USD/JPY', 'Yen per US$', 'Markets', 'D', ''),
    ('DEXUSUK', 'GBP/USD', 'US$ per pound', 'Markets', 'D', ''),
    ('DEXCHUS', 'USD/CNY', 'Yuan per US$', 'Markets', 'D', ''),
    # Government & trade
    ('GFDEBTN', 'Federal Debt: Total Public Debt', 'Millions of $', 'Government & trade', 'Q', ''),
    ('GFDEGDQ188S', 'Federal Debt as % of GDP', 'Percent', 'Government & trade', 'Q', ''),
    ('FYFSD', 'Federal Surplus or Deficit (fiscal year)', 'Millions of $', 'Government & trade', 'A', ''),
    ('BOPGSTB', 'Trade Balance: Goods and Services', 'Millions of $', 'Government & trade', 'M', ''),
]


def fetch(sid, tries=3):
    url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + sid
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (teddyrookbookclub.com data fetch)'})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode('utf-8')
        except Exception as e:  # network hiccup: retry
            last = e
            time.sleep(2 + 3 * i)
    raise last


def parse(text):
    rows = list(csv.reader(io.StringIO(text)))
    t, v = [], []
    for row in rows[1:]:
        if len(row) < 2 or row[1] in ('.', '', 'NA'):
            continue
        try:
            d = datetime.date.fromisoformat(row[0])
            x = float(row[1])
        except ValueError:
            continue
        t.append((d - datetime.date(1970, 1, 1)).days)
        v.append(round(x, 4) if abs(x) < 1e6 else round(x, 1))
    return t, v


SYM_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'markets', 'data', 'symbols.json')
# Nasdaq Trader's public symbol directory covers every stock and ETF on U.S. exchanges.
# Exchange codes in otherlisted.txt -> TradingView exchange prefixes.
EXCH = {'N': 'NYSE', 'A': 'AMEX', 'P': 'AMEX', 'Z': 'CBOE'}


def clean_name(n):
    import re
    n = n.split(' - ')[0].strip()
    return re.sub(r'\s+(Class [A-Z] )?(Common Stock|Ordinary Shares|Common Shares|American Depositary Shares).*$', '', n).strip()


def fetch_symbols():
    rows = []
    def get(name):
        req = urllib.request.Request('https://www.nasdaqtrader.com/dynamic/SymDir/' + name, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read().decode('utf-8', 'replace').splitlines()
    for line in get('nasdaqlisted.txt')[1:]:
        p = line.split('|')
        if len(p) < 8 or p[3] == 'Y' or line.startswith('File Creation'):
            continue
        rows.append([p[0], clean_name(p[1]), 'NASDAQ', 1 if p[6] == 'Y' else 0])
    for line in get('otherlisted.txt')[1:]:
        p = line.split('|')
        if len(p) < 8 or p[6] == 'Y' or line.startswith('File Creation') or p[2] not in EXCH:
            continue
        if '$' in p[0]:
            continue  # preferred shares
        rows.append([p[0], clean_name(p[1]), EXCH[p[2]], 1 if p[4] == 'Y' else 0])
    rows.sort(key=lambda r: r[0])
    with open(SYM_OUT, 'w') as f:
        json.dump(rows, f, separators=(',', ':'))
    print('Symbols: %d' % len(rows))


def main():
    os.makedirs(OUT, exist_ok=True)
    index, ok, bad = [], 0, []
    for sid, title, units, cat, freq, note in SERIES:
        try:
            t, v = parse(fetch(sid))
            if len(t) < 2:
                raise ValueError('no observations')
            with open(os.path.join(OUT, sid + '.json'), 'w') as f:
                json.dump({'id': sid, 't': t, 'v': v}, f, separators=(',', ':'))
            index.append({'id': sid, 'title': title, 'units': units, 'cat': cat, 'freq': freq, 'note': note,
                          'first': t[0], 'last': t[-1], 'lastValue': v[-1], 'prevValue': v[-2], 'n': len(t)})
            ok += 1
        except Exception as e:
            bad.append('%s (%s)' % (sid, e))
        time.sleep(0.4)  # be polite to FRED
    if not index:
        print('No series downloaded; keeping any existing data.', file=sys.stderr)
        try:
            fetch_symbols()
        except Exception as e:
            print('Symbol list failed:', e)
        return 0
    with open(os.path.join(OUT, 'index.json'), 'w') as f:
        json.dump({'updated': datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'), 'series': index}, f, separators=(',', ':'))
    print('FRED: %d series saved, %d failed' % (ok, len(bad)))
    try:
        fetch_symbols()
    except Exception as e:
        print('Symbol list failed:', e)
    for b in bad:
        print('  failed:', b)
    return 0


if __name__ == '__main__':
    sys.exit(main())
