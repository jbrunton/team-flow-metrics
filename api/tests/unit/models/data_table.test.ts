import { DataTable } from '../../../models/metrics/data_table';

describe("DataTable", () => {

  describe("#setColumns", () => {
    it("sets the table columns", () => {
      const table = new DataTable();
      const cols = [{ label: "My Col", type: "number" }];

      table.setColumns(cols);
      
      expect(table.cols).toEqual(cols);
    })
  })

  describe("#addRow", () => {
    it("appends a table row", () => {
      const table = new DataTable();
      const row1 = [1, 2, 3];
      const row2 = [4, 5, 6];

      table.addRow(row1);
      table.addRow(row2);
      
      expect(table.rows).toEqual([row1, row2]);
    })
  })

  describe("#addRows", () => {
    it("appends rows to the table", () => {
      const table = new DataTable();
      const row1 = [1, 2, 3];
      const rows = [[4, 5, 6], [7, 8, 9]];

      table.addRow(row1);
      table.addRows(rows);
      
      expect(table.rows).toEqual([row1].concat(rows));
    })
  })

  describe("#getColumnValues", () => {
    it("returns the values in the given volumn", () => {
      const table = new DataTable();
      const row1 = [1, 2, 3];
      const row2 = [4, 5, 6];

      table.addRows([row1, row2]);
      
      expect(table.getColumnValues(1)).toEqual([2, 5]);
    })
  })

  describe("#addPercentiles", () => {
    let table: DataTable;

    beforeEach(() => {
      table = new DataTable();
      table.setColumns([
        { label: "X", type: "number" },
        { label: "Y", type: "number" }
      ]);
      table.addRows([[1, 10], [2, 10], [3, 10], [4, 15], [5, 20]]);
    })

    it("adds percentile columns", () => {
      table.addPercentiles([50, 80]);
      expect(table.cols).toEqual([
        { label: "X", type: "number" },
        { label: "Y", type: "number" },
        { label: "80th Percentile", type: "number" },
        { label: "50th Percentile", type: "number" }
      ])
    })

    it("adds percentile rows", () => {
      table.addPercentiles([50, 80]);
      expect(table.rows).toEqual([
        [1, 10, null, null],
        [2, 10, null, null],
        [3, 10, null, null],
        [4, 15, null, null],
        [5, 20, null, null]
      ])
    })
  })

  describe("#build", () => {
    it("builds a Google Charts data table", () => {
      const table = new DataTable();
      table.setColumns([{ label: 'Foo', type: 'number' }])
      table.addRow([1])

      const result = table.build();

      expect(result).toEqual([
        [{ label: 'Foo', type: 'number' }],
        { c: [ { v: 1 } ] }
      ])
    })
  })
})
