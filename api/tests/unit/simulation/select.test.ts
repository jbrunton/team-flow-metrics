import { selectValue } from "../../../simulation/select";

describe("selectValue", () => {
  it("selects a number at random given the random genrator", () => {
    const values = [1, 2, 3, 5, 8];
    const generator = jest.fn();
    generator.mockReturnValueOnce(4).mockReturnValueOnce(2);

    expect(selectValue(values, generator)).toEqual(8);
    expect(selectValue(values, generator)).toEqual(3);
  });
});
