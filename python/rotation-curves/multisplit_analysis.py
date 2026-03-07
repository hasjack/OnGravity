df = pd.read_csv("out_sparc_v2/multi_split_summary.csv")

print("κ(g_bar) fit parameters")
print("a mean:", df["fit_a"].mean())
print("a std :", df["fit_a"].std())

print("b mean:", df["fit_b"].mean())
print("b std :", df["fit_b"].std())


print("κ(g_bar,shear) parameters")

print("a mean:", df["fit3_a"].mean())
print("b mean:", df["fit3_b"].mean())
print("c mean:", df["fit3_c"].mean())

print("a std:", df["fit3_a"].std())
print("b std:", df["fit3_b"].std())
print("c std:", df["fit3_c"].std())