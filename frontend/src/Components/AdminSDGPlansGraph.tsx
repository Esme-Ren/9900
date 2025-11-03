import { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { apiCallGet } from '../Utilities/ApiCalls'; 

interface GraphDataPoint {
  date: Date;
  formsCreated: number;
}

const SDGPlansGraph = () => {
  const [graphFilter, setGraphFilter] = useState('Days');
  const [dataset, setDataset] = useState<GraphDataPoint[]>([]);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await apiCallGet(`api/admin/sdg-plans/count/?time_range=${graphFilter.toLowerCase()}`, true);
        if (response?.plans && Array.isArray(response.plans)) {
          const groupedData: { [date: string]: number } = {};
          response.plans.forEach((plan: any) => {
            const date = new Date(plan.created_at).toISOString().split('T')[0];
            if (!groupedData[date]) groupedData[date] = 0;
            groupedData[date]++;
          });

          const sortedData = Object.entries(groupedData)
            .map(([date, count]) => ({ date: new Date(date), formsCreated: count }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

          let runningTotal = 0;
          const cumulativeData = sortedData.map(entry => {
            runningTotal += entry.formsCreated;
            return { ...entry, formsCreated: runningTotal };
          });

          setDataset(cumulativeData);
        }
      } catch (error) {
        console.error('Failed to fetch SDG plans graph data', error);
      }
    };

    fetchGraphData();
  }, [graphFilter]);

  const xAxisFormat = () => {
    const valueFormatter = (value: Date) => {
      if (graphFilter === "Months") {
        return value.toLocaleDateString("en-GB", { timeZone: "UTC", month: "short", year: "numeric" });
      }
      if (graphFilter === "Years") {
        return value.toLocaleDateString("en-GB", { timeZone: "UTC", year: "numeric" });
      }
      return value.toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "short" });
    };

    return {
      scaleType: 'point' as const,
      valueFormatter,
      dataKey: 'date',
    };
  };


  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
        }}
      >
        <FormControl sx={{ width: '10%', alignSelf: 'flex-end' }}>
          <InputLabel id="filter-label">Time Period</InputLabel>
          <Select
            labelId="filter-label"
            value={graphFilter}
            label="Time Period"
            onChange={(e) => setGraphFilter(e.target.value)}
          >
            <MenuItem value={'Days'}>Days</MenuItem>
            <MenuItem value={'Months'}>Months</MenuItem>
            <MenuItem value={'Years'}>Years</MenuItem>
          </Select>
        </FormControl>

        <LineChart
          dataset={dataset as any[]}
          series={[
            {
              label: 'Total forms created',
              dataKey: 'formsCreated',
              showMark: false,
              valueFormatter: (value) => `${value}`,
              curve: 'monotoneX',
              color: 'url(#myGradient)',
            },
          ]}
          xAxis={[xAxisFormat()]}
          yAxis={[
            {
              disableLine: true,
              disableTicks: true,
              valueFormatter: (value) => `${value}`,
            },
          ]}
          height={400}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'top', horizontal: 'right' },
            },
          }}
        >
          <defs>
            <linearGradient id="myGradient">
              <stop offset="5%" stopColor="#a7c6fc" />
              <stop offset="95%" stopColor="#166afa" />
            </linearGradient>
          </defs>
        </LineChart>
      </Box>
    </>
  );
};

export default SDGPlansGraph;
