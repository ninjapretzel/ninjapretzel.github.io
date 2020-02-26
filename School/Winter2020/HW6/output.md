# Output from running matrix.js:
```
λ node matrix.js
====================================================================
====================================================================

Analysis of 2^(k=3) data =
[
  [ 90 ], [ 150 ],
  [ 60 ], [ 5 ],
  [ 20 ], [ 50 ],
  [ 40 ], [ 40 ]
]

--------------------------------------

SSTs for column q[0]:
{
  Column_qx: [
     56.875,   4.375,
    -20.625, -19.375,
    -18.125,   3.125,
     23.125,  10.625
  ],
  SS: {
    SST: 14446.875,
    SSA: 153.125,
    SSB: 3403.125,
    SSC: 3003.125,
    SSAB: 2628.125,
    SSAC: 78.125,
    SSBC: 4278.125,
    SSABC: 903.125
  },
  Variation: [
    { name: 'BC', val: 0.2961280553752974 },
    { name: 'B', val: 0.23556132381570408 },
    { name: 'C', val: 0.20787367510274712 },
    { name: 'AB', val: 0.18191650443434998 },
    { name: 'ABC', val: 0.06251351935972313 },
    { name: 'A', val: 0.010599178022928835 },
    { name: 'AC', val: 0.0054077438892494055 }
  ]
}
```

# a.
`Column_qx` shows the effects of each, and their interactions in order: `[ I, A, B, C, AB, AC, BC, ABC ]`

# b.
`Variation` shows the effect of each as a percentage of the total.

# c.
`Variation` is sorted, showing the BC has the highest contribution by percentage.

