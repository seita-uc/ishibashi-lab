from matplotlib import pyplot as plt
from random import randint, random
import sys
import csv

sim_a_csv_file = open("./tmp/sim_a.csv", "r", errors="", newline="")
sim_b_csv_file = open("./tmp/sim_b.csv", "r", errors="", newline="")

sim_a_data = csv.reader(sim_a_csv_file, delimiter=",", doublequote=True, lineterminator="\r\n", quotechar='"', skipinitialspace=True)
sim_b_data = csv.reader(sim_b_csv_file, delimiter=",", doublequote=True, lineterminator="\r\n", quotechar='"', skipinitialspace=True)

axValues = []
ayValues = []
for i, data in enumerate(sim_a_data):
    if i == 0 or len(data) < 2:
        continue;
    tryNum = data[0]
    rate = data[1]
    axValues.append(int(tryNum))
    ayValues.append(int(rate))

bxValues = []
byValues = []
for i, data in enumerate(sim_b_data):
    if i == 0 or len(data) < 2:
        continue;
    tryNum = data[0]
    rate = data[1]
    bxValues.append(int(tryNum))
    byValues.append(int(rate))

# グラフの描画
fig = plt.figure()
fig.tight_layout()

x = fig.add_subplot(2, 1, 1, ylabel='success rate', xlabel='number of trials')
x.plot(axValues, ayValues, label='simulation_a')

# bx = fig.add_subplot(2, 1, 2, ylabel='success rate', xlabel='number of trials')
x.plot(bxValues, byValues, label='simulation_b')

x.legend(loc=0)

plt.show()
