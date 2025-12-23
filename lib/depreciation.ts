export function calculateDepreciation(asset: any) {
  const monthsUsed =
    (Date.now() - new Date(asset.PurchaseDate).getTime()) /
    (1000 * 60 * 60 * 24 * 30);

  const monthlyDep =
    (asset.PurchaseCost - asset.salvageValue) / asset.usefulLifeMonths;

  const accumulated = Math.min(
    monthlyDep * monthsUsed,
    asset.PurchaseCost - asset.salvageValue
  );

  const bookValue = asset.PurchaseCost - accumulated;

  return {
    monthlyDepreciation: Math.round(monthlyDep),
    accumulatedDepreciation: Math.round(accumulated),
    bookValue: Math.round(bookValue),
  };
}
