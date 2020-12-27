import { excludeOutliers } from "../../../helpers/data_helper";

describe("#excludeOutliers", () => {
  it("excludes outliers using the Tukey Fence method", () => {
    const data = [1, 102, 103, 104, 105, 106, 107, 108, 209, 210];
    const result = excludeOutliers(data, (x) => x);
    expect(result).toEqual([102, 103, 104, 105, 106, 107, 108]);
  });

  it("doesn't exclude outliers if there are none", () => {
    const data = [1, 2, 3, 4, 5];
    const result = excludeOutliers(data, (x) => x);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
