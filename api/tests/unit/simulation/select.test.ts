import { newGenerator, selectValue } from "../../../simulation/select";

describe("newGenerator", () => {
  it("returns a random number generator", () => {
    const generator = newGenerator(123);

    expect(generator(10)).toEqual(9);
    expect(generator(10)).toEqual(3);
    expect(generator(10)).toEqual(0);
  });
});

describe("selectValue", () => {
  it("selects a number at random given the random genrator", () => {
    const values = [1, 2, 3, 5, 8];
    const generator = jest.fn();
    generator.mockReturnValueOnce(4).mockReturnValueOnce(2);

    expect(selectValue(values, generator)).toEqual(8);
    expect(selectValue(values, generator)).toEqual(3);
  });
});
