import { useState, useEffect } from 'react';
import { Box, FormControl, MenuItem, Select, Typography, useMediaQuery, useTheme } from '@mui/material';

const options = [
  'Education Impact',
  'Research Impact',
  'Social Impact',
  'Local Community Impact',
  'Commercial Impact',
  'Environmental Impact',
  'Family Impact',
  'Leadership Impact',
  'Policy Impact'
];

interface Props {
  value: { rank1: string; rank2: string; rank3: string },
  onChange: (types: { rank1: string; rank2: string; rank3: string }) => void,
}

const ImpactTypes = ({ value, onChange }: Props) => {
  const [ranks, setRanks] = useState({ rank1: '', rank2: '', rank3: '' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setRanks(value);
  }, [value]);

  const handleChange = (rankKey: string, value: string) => {
    const updated = { ...ranks, [rankKey]: value };
    setRanks(updated);
    onChange(updated);
  };

  const selectedValues = Object.values(ranks);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">
        What are the types of impact your Project creates? Please pick three and rank
        them from 1 to 3, with 1 being the most important impact.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: isMobile ? '100%' : '30%',
        }}
      >
        {['rank1', 'rank2', 'rank3'].map((rankKey, index) => (
          <Box key={rankKey}>
            <Typography variant="body1">Rank {index + 1}</Typography>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={ranks[rankKey as keyof typeof ranks]}
                onChange={(e) => handleChange(rankKey, e.target.value)}
              >
                <MenuItem disabled value="">
                  Dropdown option
                </MenuItem>
                {options.map((option) => {
                  const isSelectedElsewhere =
                    selectedValues.includes(option) &&
                    ranks[rankKey as keyof typeof ranks] !== option;

                  return (
                    <MenuItem key={option} value={option} disabled={isSelectedElsewhere}>
                      {option}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImpactTypes;