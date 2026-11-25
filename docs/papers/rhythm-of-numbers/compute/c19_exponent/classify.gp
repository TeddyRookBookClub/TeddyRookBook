\\ classify.gp -- exact exponent of the class group for each field kept by prefilter.py, with no hypothesis.
\\ The classes of the prime ideals of norm at most sqrt(|D|/3) generate the class group (every class
\\ holds a reduced form, whose first coefficient is at most sqrt(|D|/3)), so the exponent of the group
\\ is the least common multiple of the orders of the prime forms up to that bound.
ord(f, D) = { my(g = f, k = 1); while(g != g^0 && k <= 5, g = g*f; k++); k; }   \\ 6 means "more than 5"
expo(D) = { my(E = 1, B = sqrtint(abs(D)\3), o); forprime(p = 2, B, if(kronecker(D, p) >= 0, o = ord(qfbprimeform(D, p), D); if(o > 5, return(0)); E = lcm(E, o); if(E > 5, return(0)))); E; }
{ my(L = readstr("pre.txt"), cnt = vector(5), big = vector(5), n, D, E);
  for(i = 1, #L, n = eval(strsplit(L[i], " ")[1]); D = -n; if(!isfundamental(D), error("not fundamental ", D));
    E = expo(D); if(E, cnt[E]++; big[E] = max(big[E], n); write("expo-list.txt", E, " ", n)));
  print("candidates ", #L); for(E = 1, 5, print("exponent ", E, ": ", cnt[E], " fields, largest |D| = ", big[E])); }
