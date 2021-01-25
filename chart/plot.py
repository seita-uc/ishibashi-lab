from matplotlib import pyplot as plt
from random import randint, random
import sys
import csv

xValues = []
yValues = []
csv_inputs = csv.reader(sys.stdin)
for i, inputs in enumerate(csv_inputs):
    if i == 0 or len(inputs) < 2:
        continue;
    tryNum = inputs[0]
    rate = inputs[1]
    xValues.append(int(tryNum))
    yValues.append(float(rate))

# print(xValues)
# print(yValues)

# グラフの描画
fig = plt.figure()

ax = fig.add_subplot(2, 1, 1, ylabel='success rate', xlabel='number of trials')
ax.plot(xValues, yValues)

plt.show()
