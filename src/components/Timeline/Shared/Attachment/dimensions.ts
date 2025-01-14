export const aspectRatio = ({
  total,
  index,
  width,
  height
}: {
  total: number
  index?: number
  width?: number
  height?: number
}): number => {
  const cropTooTall = (height || 1) / (width || 1) > 3 / 2 ? 2 / 3 : (width || 1) / (height || 1)

  const isEven = total % 2 == 0
  if (total > 5) {
    switch (isEven) {
      case true:
        return total / 2 / 2
      case false:
        if ((index || -2) + 1 == total) {
          return Math.ceil(total / 2)
        } else {
          return Math.ceil(total / 2) / 2
        }
    }
  } else {
    switch (isEven) {
      case true:
        return cropTooTall
      case false:
        if ((index || -2) + 1 == total) {
          return cropTooTall * 2
        } else {
          return cropTooTall
        }
    }
  }
}
