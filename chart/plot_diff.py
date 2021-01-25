from matplotlib import pyplot as plt
from random import randint, random
import sys
import csv

fig = plt.figure()
x = fig.add_subplot(2, 1, 1, ylabel='difference', xlabel='number of trials')

csv_inputs = csv.reader(sys.stdin)
xValues = []
yValues = []
for i, inputs in enumerate(csv_inputs):
    if i == 0 or len(inputs) < 2:
        continue;
    tryNum = inputs[0]
    xValues.append(int(tryNum))
    rates = inputs[1:]

    for i, rate in enumerate(rates):
        if len(yValues) == 0 or len(yValues) <= i:
            yValues.append([])
        yValues[i].append(float(rate))

for i, yvs in enumerate(yValues):
    x.plot(xValues, yvs)

plt.show()
