import { DataTableBuilder } from "../../../../models/metrics/data_table_builder";

describe("DataTableBuilder", () => {
  describe("#setColumns", () => {
    it("sets the table columns", () => {
      const builder = new DataTableBuilder();
      const cols = [{ label: "My Col", type: "number" }];

      builder.setColumns(cols);

      expect(builder.cols).toEqual(cols);
    });
  });

  describe("#addRow", () => {
    it("appends a table row", () => {
      const builder = new DataTableBuilder();
      const row1 = [1, 2, 3];
      const row2 = [4, 5, 6];

      builder.addRow(row1);
      builder.addRow(row2);

      expect(builder.rows).toEqual([row1, row2]);
    });
  });

  describe("#addRows", () => {
    it("appends rows to the table", () => {
      const builder = new DataTableBuilder();
      const row1 = [1, 2, 3];
      const rows = [
        [4, 5, 6],
        [7, 8, 9],
      ];

      builder.addRow(row1);
      builder.addRows(rows);

      expect(builder.rows).toEqual([row1].concat(rows));
    });
  });

  describe("#getColumnValues", () => {
    it("returns the values in the given volumn", () => {
      const builder = new DataTableBuilder();
      const row1 = [1, 2, 3];
      const row2 = [4, 5, 6];

      builder.addRows([row1, row2]);

      expect(builder.getColumnValues(1)).toEqual([2, 5]);
    });
  });

  describe("#addPercentiles", () => {
    let builder: DataTableBuilder;

    beforeEach(() => {
      builder = new DataTableBuilder();
      builder.setColumns([
        { label: "X", type: "number" },
        { label: "Y", type: "number" },
      ]);
    });

    describe("if no or little data", () => {
      it("adds no percentile rows", () => {
        builder.addRow([1, 2, 3]);
        builder.addPercentiles(1, [50, 80], 1, 5);
        expect(builder.rows).toEqual([[1, 2, 3]]);
      });
    });

    describe("given data", () => {
      beforeEach(() => {
        builder.addRows([
          [1, 10],
          [2, 10],
          [3, 10],
          [4, 15],
          [5, 20],
        ]);
      });

      it("adds percentile columns", () => {
        builder.addPercentiles(1, [50, 80], 1, 5);
        expect(builder.cols).toEqual([
          { label: "X", type: "number" },
          { label: "Y", type: "number" },
          { label: "80th Percentile", type: "number" },
          { label: "50th Percentile", type: "number" },
        ]);
      });

      it("adds percentile rows", () => {
        builder.addPercentiles(1, [50, 80], 1, 5);
        expect(builder.rows).toEqual([
          [1, null, 15, 10],
          [5, null, 15, 10],
          [1, 10, null, null],
          [2, 10, null, null],
          [3, 10, null, null],
          [4, 15, null, null],
          [5, 20, null, null],
        ]);
      });

      it("adds null rows if there are no data", () => {
        builder.addPercentiles(1, [50, 80], 1, 5);
        expect(builder.rows).toEqual([
          [1, null, 15, 10],
          [5, null, 15, 10],
          [1, 10, null, null],
          [2, 10, null, null],
          [3, 10, null, null],
          [4, 15, null, null],
          [5, 20, null, null],
        ]);
      });
    });
  });

  describe("#build", () => {
    it("builds a Google Charts data table", () => {
      const builder = new DataTableBuilder();
      builder.setColumns([{ label: "Foo", type: "number" }]);
      builder.addRow([1]);

      const result = builder.build();

      expect(result).toEqual({
        cols: [{ label: "Foo", type: "number" }],
        rows: [{ c: [{ v: 1 }] }],
      });
    });

    it("returns an empty table if no rows", () => {
      const builder = new DataTableBuilder();
      builder.setColumns([{ label: "Foo", type: "number" }]);

      const result = builder.build();

      expect(result).toEqual({
        cols: [{ label: "Foo", type: "number" }],
        rows: [],
      });
    });
  });
});
