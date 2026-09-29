export const calculateTotalPajak = (rincianPajak) => {
  if (!rincianPajak) return 0
  const {
    pkb = 0,
    opkb = 0,
    dpkb = 0,
    odpkb = 0,
    swd = 0,
    dswd = 0
  } = rincianPajak
  return pkb + opkb + dpkb + odpkb + swd + dswd
}
