import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Agency } from "../../types/agency.type";
import HeatMap from "../HeatMap";

// Mock the Syncfusion HeatMap component since we don't need to test its internal functionality
jest.mock("@syncfusion/ej2-react-heatmap", () => ({
  HeatMapComponent: ({}) => <div data-testid="heatmap-component"></div>,
  Inject: () => null,
  Legend: "Legend",
  Tooltip: "Tooltip",
}));

describe("HeatMap", () => {
  const mockData = [
    {
      agency: { short_name: "Agency1" } as Agency,
      counts: [
        { date: "2024-01-01", count: 5 },
        { date: "2024-01-02", count: 3 },
      ],
    },
    {
      agency: { short_name: "Agency2" } as Agency,
      counts: [
        { date: "2024-01-01", count: 2 },
        { date: "2024-01-02", count: 4 },
      ],
    },
  ];

  it("renders no data message when data array is empty", () => {
    render(<HeatMap data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders HeatMapComponent when data is provided", () => {
    render(<HeatMap data={mockData} />);

    // Check if HeatMapComponent is rendered
    expect(screen.getByTestId("heatmap-component")).toBeInTheDocument();
  });
});
