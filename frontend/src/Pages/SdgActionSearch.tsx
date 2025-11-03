// src/pages/SdgActionSearch.tsx
import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { apiCallGet, apiCallPost } from '../Utilities/ApiCalls'
import Page from '../Components/Page'
import SearchSDGPlanModal from '../Components/SearchSDGPlanModal';
import activityTracker from '../Utilities/ActivityTracker';


// 1) Define the shape of your backend rows
interface ActionRow {
  id: number
  actions: string
  action_detail: string
  award: number
  award_description: string
  related_industry_org: string[]
  sdgs: number[] | number
  individual_organization: 0 | 1 | 2
  sources: string
  links: string
  additional_notes: string
}

// 2) Options for filters
const SDG_TITLES = [
  "No Poverty",
  "Zero Hunger",
  "Good Health",
  "Quality Education",
  "Gender Equality",
  "Clean Water",
  "Clean Energy",
  "Economic Growth",
  "Innovation",
  "Reduced Inequalities",
  "Sustainable Cities",
  "Resp. Consumption",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace, Justice",
  "Partnerships"
];

const LEVELS_TITLES = [
  "on Couch, Individual action",
  "at Home, Individual action",
  "in Community, Individual action",
  "at School and Work, Individual action",
  "Organization action",
  "Government action",
];


const SDG_OPTIONS = SDG_TITLES.map((title, idx) => ({
  value: idx + 1,
  label: `SDG ${idx + 1} - ${title}`
}));

const LEVEL_OPTIONS = LEVELS_TITLES.map((title, idx) => ({
  value: idx + 1,
  label: `Level ${idx + 1} - ${title}`
}))
const INDUSTRY_OPTIONS = [
  'Agriculture, forestry and fishing',
  'Mining',
  'Manufacturing',
  'Electricity, gas, water and waste services',
  'Construction',
  'Wholesale and retail trade',
  'Accommodation and food services',
  'Transport, postal and warehousing',
  'Information media and telecommunications',
  'Financial and insurance services',
  'Rental hiring and real estate services',
  'Professional services',
  'Public administration and safety',
  'Education and training',
  'Health care and social assistance',
  'Arts and recreation services'
]

export default function SdgActionSearch() {
  // filters
  const [searchText, setSearchText] = useState('')
  const [individualOrg, setIndividualOrg] = useState<0|1|2|3>(0)
  const [digitalAction, setDigitalAction] = useState<0|1>(0)
  const [award, setAward] = useState<0|1>(0) 
  const [level, setLevel] = useState<number[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [sdgs, setSdgs] = useState<number[]>([])

  // results + pagination
  const [results, setResults] = useState<ActionRow[]>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<ActionRow | null>(null)
  // building api call
  async function fetchData() {
    try {
      console.log('Fetching data...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const params = new URLSearchParams()
      if (searchText)            params.append('actions', searchText)
      if (individualOrg !== 0)   params.append('individual_organization', String(individualOrg - 1))
      if (digitalAction !== 0)   params.append('digital_actions',         String(digitalAction))
      if (award           !== 0) params.append('award',                   String(award))
      level.forEach((l) =>       params.append('level', String(l)))
      industries.forEach((i) =>  params.append('related_industry_org', i))
      sdgs.forEach((s) =>        params.append('sdgs', String(s)))
      params.append('page', String(page))
      params.append('per_page', String(perPage))

      const url = `/api/sdg-actions/filter-search/?${params.toString()}`;
      console.log('API URL:', url);

      const res = await apiCallGet(url, true)
      console.log('API Response:', res);
      
      if (res.statusCode === 200) {
        setResults(res.results);
        setCount(res.count);
        setTotalPages(Math.ceil(res.count / perPage));
        console.log('Data set successfully. Results count:', res.results?.length);
      } else {
        console.error('API returned error status:', res.statusCode);
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // refetch on page change
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [page, perPage])

  // When hitting “Search”
  const handleSearch = () => {
    setPage(1)
    fetchData()
    activityTracker.trackSearch(searchText, 'action');
  }

  const [trendingSearches, setTrendingSearches] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const getTrendingActionSearches = async () => {
    const trending = await apiCallPost('/api/admin/analytics/actions/top/', {}, false);
    return Object.values(trending).slice(0, 2);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (trendingSearches.length === 0) {
      getTrendingActionSearches().then(setTrendingSearches);
    }
  };

  return (
    <Page>
      <Box display="flex" height="100vh">
        {/*Sidebar*/}
        <Box width={300} p={2} overflow="auto" bgcolor="#fff" sx={{ borderRadius: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem', 
            }}
          >
            Search Keyword
          </Typography>          <Box display="flex" alignItems="center" mb={2}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Search actions"
                size="small"
                fullWidth
                onFocus={handleFocus}
                onBlur={() => setIsFocused(false)}
                placeholder="Search actions"
                value={searchText || ''}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {isFocused && trendingSearches.length > 0 && (
                <Box sx={{
                  background: 'white',
                  boxShadow: 2,
                  borderRadius: 2,
                  mt: 1,
                  p: 2,
                  width: '100%',
                  zIndex: 10,
                  position: 'absolute'
                }}>
                  {trendingSearches.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { background: '#f5f5f5' }
                      }}
                      onMouseDown={() => setSearchText(item.actionName || item.title)}
                    >
                      <SearchIcon sx={{ color: 'green', mr: 1 }} />
                      <Typography>{item.actionName || item.title}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Button onClick={handleSearch} aria-label="Search" >
              <SearchIcon />
            </Button>
          </Box>
          <Stack spacing={1} width={300}>
  
            {/* Individual or Organisation */}
            <Typography
              variant="subtitle1"
              gutterBottom     
              sx={{
                fontWeight: 'bold',  
                fontSize: '1.25rem',
                mt: 1,          
              }}
            >
              Individual or Organisation
            </Typography>
            <Box>
              <ToggleButtonGroup
                value={individualOrg}
                exclusive
                size="small"
                onChange={(_, v) => v !== null && setIndividualOrg(v)}
                sx={{
                  width: '100%',
                  bgcolor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {['Any','Indv.','Org.','Both'].map((lab,i) => (
                  <ToggleButton
                    key={i}
                    value={i}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      color: 'black',
                      '&.Mui-selected': { bgcolor: '#00838F', color: 'white' },
                    }}
                  >
                    {lab}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Digital Action */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',  
                fontSize: '1.25rem',
                mt: 1, 
              }}
            >
              Digital Action
            </Typography>
              <Box>
              <ToggleButtonGroup
                value={digitalAction}
                exclusive
                size="small"
                onChange={(_, v) => v !== null && setDigitalAction(v)}
                sx={{
                  width: '100%',
                  bgcolor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {['Any','Yes'].map((lab,i) => (
                  <ToggleButton
                    key={i}
                    value={i}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      color: 'black',
                      '&.Mui-selected': { bgcolor: '#00838F', color: 'white' },
                    }}
                  >
                    {lab}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Awards */}
            <Typography
              variant="subtitle1"
              gutterBottom 
              sx={{
                fontWeight: 'bold', 
                fontSize: '1.25rem', 
                mt: 1, 
              }}
            >
              Awards
            </Typography>
            <Box>
              <ToggleButtonGroup
                value={award}
                exclusive
                size="small"
                onChange={(_, v) => v !== null && setAward(v)}
                sx={{
                  width: '100%',
                  bgcolor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {['Any','Yes'].map((lab,i) => (
                  <ToggleButton
                    key={i}
                    value={i}
                    sx={{
                      flex: 1,
                      textTransform: 'none',
                      color: 'black',
                      '&.Mui-selected': { bgcolor: '#00838F', color: 'white' },
                    }}
                  >
                    {lab}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Typography
              variant="subtitle1"
              gutterBottom     
              sx={{
                fontWeight: 'bold',  
                fontSize: '1.25rem',
                mt: 1,             
              }}
            >
              Level
            </Typography>
            {/* Levels */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Levels</InputLabel>
              <Select
                multiple
                value={level}
                label="Levels"
                onChange={(e) =>
                  setLevel(
                    typeof e.target.value === 'string'
                      ? e.target.value.split(',').map(Number)
                      : (e.target.value as number[])
                  )
                }
              >
                {LEVEL_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography
              variant="subtitle1"
              gutterBottom   
              sx={{
                fontWeight: 'bold',  
                fontSize: '1.25rem', 
                mt: 1,              
              }}
            >
              Industries
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Industries</InputLabel>
              <Select
                multiple
                value={industries}
                label="Industries"
                onChange={(e) =>
                  setIndustries(
                    typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : (e.target.value as string[])
                  )
                }
              >
                {INDUSTRY_OPTIONS.map((str) => (
                  <MenuItem key={str} value={str}>
                    {str}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              fontWeight: 'bold', 
              fontSize: '1.25rem',
              mt: 2,    
              mb: 1,     
            }}
          >
            Related SDGs
          </Typography>
          <FormGroup row>
            {SDG_OPTIONS.map((o) => (
              <FormControlLabel
                key={o.value}
                control={
                  <Checkbox
                    size="small"
                    checked={sdgs.includes(o.value)}
                    onChange={() =>
                      setSdgs((prev) =>
                        prev.includes(o.value)
                          ? prev.filter((x) => x !== o.value)
                          : [...prev, o.value]
                      )
                    }
                  />
                }
                label={o.label}
              />
            ))}
          </FormGroup>

          <Box mt={2}>
            <Button fullWidth variant="contained" onClick={handleSearch} sx={{ bgcolor: '#00838F', borderRadius: 1 }}>
              Search
            </Button>
          </Box>
        </Box>

        {/* Results */}
        <Box flex={1} p={2} overflow="auto">
          <Typography variant="subtitle2" mb={1}>
            {count} item{count === 1 ? '' : 's'} found
          </Typography>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>RELATED SDGS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>INDV. | ORG.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {results.length > 0 ? results.map(row => (
                <TableRow key={row.id}>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => {
                        setSelectedRow(row)
                        setModalOpen(true)
                      }}
                    >
                      {row.actions}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>
                    {Array.isArray(row.sdgs)
                      ? row.sdgs.join(', ')
                      : row.sdgs === 18
                      ? 'All SDGs'
                      : row.sdgs}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>
                    {row.individual_organization === 0
                      ? 'Individual'
                      : row.individual_organization === 1
                      ? 'Organization'
                      : 'Both'}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          </Paper>

          <Box
            mt={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormControl size="small">
              <InputLabel>Rows</InputLabel>
              <Select
                value={perPage}
                label="Rows"
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                {[25, 50, 100].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
            />
          </Box>
        </Box>
      </Box>

    {/* Modal */}
    {selectedRow && (
      <SearchSDGPlanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedRow.actions}
        aims={selectedRow.action_detail} 
        descriptions={selectedRow.additional_notes}
        organisation={selectedRow.related_industry_org?.join(', ') || ''}
        sources={selectedRow.sources}
        links={selectedRow.links}
      />
    )}
    </Page>
  )
}
