import { useState } from 'react';
import { Box, Checkbox, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  value: string[],
  onSelectionChange: (selected: string[]) => void,
}

const items = [
  'SDG 1: No Poverty',
  'SDG 2: Zero Hunger',
  'SDG 3: Good Health and Well-being',
  'SDG 4: Quality Education',
  'SDG 5: Gender Equality',
  'SDG 6: Clean Water and Sanitation',
  'SDG 7: Affordable and Clean Energy',
  'SDG 8: Decent Work and Economic Growth',
  'SDG 9: Industry, Innovation, and Infrastructure',
  'SDG 10: Reduced Inequality',
  'SDG 11: Sustainable Cities and Communities',
  'SDG 12: Responsible Consumption and Production',
  'SDG 13: Climate Action',
  'SDG 14: Life Below Water',
  'SDG 15: Life on Land',
  'SDG 16: Peace, Justice, and Strong Institutions',
  'SDG 17: Partnerships for the Goals',
];

const SDGList = ({ value, onSelectionChange }: Props) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    setSelectedItems(value); // sync parent value into local state
  }, [value]);

  const handleToggle = (item: string) => {
    const updated = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];

    setSelectedItems(updated);
    onSelectionChange(updated); 
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Which of the following Sustainable Development Goals (SDGs) do you believe
        your Project has the most impact on? Please select top 3 from the below.
      </Typography>
      <List sx={{ padding: 0 }}>
        { items.map((item) => (
          <ListItem key={item} sx={{ cursor: 'pointer', py: 0.5, minHeight: 30 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Checkbox
                edge='start'
                checked={selectedItems.includes(item)}
                onChange={() => handleToggle(item)}
                size='small'
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color: selectedItems.includes(item) ? '#1876d0' : 'black',
                    fontSize: '0.85rem',
                  }}
                >
                  {item}
                </Typography>
              }
              onClick={() => handleToggle(item)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SDGList;

