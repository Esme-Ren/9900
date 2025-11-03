import React, { useState, useEffect } from 'react'
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
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { apiCallGet , apiCallPost} from '../Utilities/ApiCalls'
import Page from '../Components/Page'
import SearchSDGPlanModal from '../Components/SearchSDGPlanModal';
import activityTracker from '../Utilities/ActivityTracker';


interface EducationRow {
  id: number
  title: string
  organization: string
  location: string
  learning_outcome: string
  related_to_which_discipline: string[]
  useful_for_which_industries: string[]
  type_label: string[]
  sdgs_related: number[] | number
  descriptions: string
  sources: string
  links: string
}

const LOCATION_OPTIONS = [
  'Australia',
  'Austria',
  'Brazil',
  'Canada',
  'China Mainland',
  'European Union',
  'India',
  'Ireland',
  'Italy',
  'Malaysia',
  'Mexico',
  'New Zealand',
  'Russia',
  'Spain',
  'Sweden',
  'Switzerland',
  'Taiwan ROC',
  'United Kingdom',
  'United States',
  'Global',
]

const DISCIPLINE_OPTIONS = [
  'Architecture and Building',
  'Business and Management',
  'Creative Arts',
  'Education',
  'Engineering and Related Technologies',
  'Environmental and Related Studies',
  'Health',
  'Humanities and Law',
  'Information Technology',
  'Natural and Physical Sciences',
  'All',
]

const INDUSTRY_OPTIONS = [
  'Agriculture forestry and fishing',
  'Mining',
  'Manufacturing',
  'Electricity gas water and waste services',
  'Construction',
  'Wholesale and retail trade',
  'Accommodation and food services',
  'Transport postal and warehousing',
  'Information media and telecommunications',
  'Financial and insurance services',
  'Rental hiring and real estate services',
  'Professional services',
  'Public administration and safety',
  'Education and training',
  'Health care and social assistance',
  'Arts and recreation services',
]

const RESOURCE_OPTIONS = [
  'Undergraduate course',
  'Postgraduate course',
  'Initiative',
  'Event',
  'Seminar',
  'Undergraduate program',
  'Postgraduate program',
  'Practicum online course',
  'MOOC',
  'Case study',
  'Report',
  'Blog',
  'Edu Tool',
  'Simulation',
  'Game',
  'VR video',
  'Film',
  'Contest',
]

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

const SDG_OPTIONS = SDG_TITLES.map((title, idx) => ({
  value: idx + 1,
  label: `SDG ${idx + 1} - ${title}`
}));

const getTrendingEducationSearches = async () => {
  const trending = await apiCallPost('/api/admin/analytics/educations/top/', {}, false);
  return Object.values(trending).slice(0, 4);
}  

  export default function SdgEducationearch() {
    // filters
    const [searchText, setSearchText] = useState('')
    const [institution, setInstitution] = useState('')
    const [location, setLocation] = useState<string[]>([])
    const [discipline, setDiscipline] = useState<string[]>([])
    const [industries, setIndustries] = useState<string[]>([])
    const [educationResource, setEducationResource] = useState<string[]>([])
    const [sdgs, setSdgs] = useState<number[]>([])
  
    // results + pagination
    const [results, setResults] = useState<EducationRow[]>([])
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(25)
    const [totalPages, setTotalPages] = useState(1)
    const [count, setCount] = useState(0)
  
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<EducationRow | null>(null)
    // building api call
    async function fetchData() {
      try {
        const params = new URLSearchParams()
        if (searchText)                   params.append('search', searchText)
        if (institution)                  params.append('institution', institution)
        location.forEach((l) =>           params.append('location', String(l)))
        discipline.forEach((d) =>         params.append('discipline', String(d)))
        industries.forEach((i) =>         params.append('industries', i))
        educationResource.forEach((r) =>  params.append('educational_resources', r))
        sdgs.forEach((s) =>               params.append('sdgs', String(s)))
        params.append('page', String(page))
        params.append('per_page', String(perPage))
  
        const res = await apiCallGet(
          `/api/sdg-education/filter-search/?${params.toString()}`,
          true
        )
        if (res.statusCode === 200) {
          setResults(res.results);
          setCount(res.count);
          setTotalPages(Math.ceil(res.count / perPage));
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
  
    useEffect(() => {
      // page load get trending searches
      getTrendingEducationSearches().then(setTrendingSearches);
    }, []);

    // When hitting “Search”
    const handleSearch = () => {
      setPage(1)
      fetchData()
      activityTracker.trackSearch(searchText, 'education');
    }

    const [trendingSearches, setTrendingSearches] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
      setIsFocused(true);
      if (trendingSearches.length === 0) {
        console.log('Fetching trending education searches...');
        getTrendingEducationSearches().then((data) => {
          console.log('Trending searches data:', data);
          setTrendingSearches(data);
        }).catch((error) => {
          console.error('Error fetching trending searches:', error);
        });
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
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Box sx={{ position: 'relative' }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search..."
                value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={() => setIsFocused(false)}
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
                        onMouseDown={() => setSearchText(item.educationName)}
                      >
                        <SearchIcon sx={{ color: 'green', mr: 1 }} />
                        <Typography>{item.educationName}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <Button onClick={handleSearch}>
                <SearchIcon />
              </Button>
            </Box>
            <Stack spacing={1} width={300}>
  
            {/* Institution */}
            <Typography
                variant="subtitle1"
                gutterBottom     
                sx={{
                  fontWeight: 'bold',  
                  fontSize: '1.25rem',
                  mt: 1,             
                }}
              >
                Institution (University)
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Institution (University)"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </Box>

              {/* Location */}
              <Typography
                variant="subtitle1"
                gutterBottom     
                sx={{
                  fontWeight: 'bold',  
                  fontSize: '1.25rem',
                  mt: 1,             
                }}
              >
                Location
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Location</InputLabel>
                <Select
                  multiple
                  value={location}
                  label="Location"
                  onChange={e => {
                    const val = e.target.value
                    setLocation(typeof val === 'string' 
                      ? val.split(',').map(s => s.trim())
                      : (val as string[])
                    )
                  }}
                >
                  {LOCATION_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
  
              {/* Discipline */}
              <Typography
                variant="subtitle1"
                gutterBottom     
                sx={{
                  fontWeight: 'bold',  
                  fontSize: '1.25rem',
                  mt: 1,             
                }}
              >
                Discipline
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Discipline</InputLabel>
                <Select
                  multiple
                  value={discipline}
                  label="Discipline"
                  onChange={e => {
                    const val = e.target.value
                    setDiscipline(typeof val === 'string' 
                      ? val.split(',').map(s => s.trim())
                      : (val as string[])
                    )
                  }}
                >
                  {DISCIPLINE_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Industries */}
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
                  onChange={e => {
                    const val = e.target.value
                    setIndustries(typeof val === 'string' 
                      ? val.split(',').map(s => s.trim())
                      : (val as string[])
                    )
                  }}
                >
                  {INDUSTRY_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Education Resource */}
              <Typography
                variant="subtitle1"
                gutterBottom     
                sx={{
                  fontWeight: 'bold',  
                  fontSize: '1.25rem',
                  mt: 1,             
                }}
              >
                Type of education resources
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Education type</InputLabel>
                <Select
                  multiple
                  value={educationResource}
                  label="Education type"
                  onChange={e => {
                    const val = e.target.value
                    setEducationResource(typeof val === 'string' 
                      ? val.split(',').map(s => s.trim())
                      : (val as string[])
                    )
                  }}
                >
                  {RESOURCE_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
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
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>ORGANIZATION</TableCell>
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
                          {row.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>
                        {Array.isArray(row.sdgs_related)
                          ? row.sdgs_related.join(', ')
                          : row.sdgs_related === 18
                          ? 'All SDGs'
                          : row.sdgs_related}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>
                        {row.organization}
                      </TableCell>
                    </TableRow>
                    ))
                    : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No results found
                        </TableCell>
                      </TableRow>
                    )
                  }
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
            title={selectedRow.title}
            aims={selectedRow.learning_outcome} 
            descriptions={selectedRow.descriptions}
            organisation={selectedRow.organization}
            sources={selectedRow.sources}
            links={selectedRow.links}
          />
        )}
      </Page>
    )
  }
  