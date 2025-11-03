import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, Pagination, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { apiCallGet } from '../Utilities/ApiCalls';
import Page from '../Components/Page';
import activityTracker from '../Utilities/ActivityTracker';
import PageModal from '../Components/PageModal';
import { PageButtonColour } from '../Components/PageButton';

interface KeywordRow {
  id: number;
  keyword: string;
  sdggoal: string;
  target: string;
  reference1: string;
  reference2: string;
  note: string;
}

const PER_PAGE = 20;

const SdgKeywordsSearch: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<KeywordRow[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<KeywordRow | null>(null);

  // 搜索和分页
  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      if (searchText) params.append('search', searchText);
      params.append('page', String(page));
      params.append('ordering', 'keyword');
      const res = await apiCallGet(`/api/sdg_keywords/keywords/?${params.toString()}`, false);

      // 兼容分页和非分页，且保证results一定是数组
      let data: KeywordRow[] = [];
      let total = 0;
      if (Array.isArray(res)) {
        data = res;
        total = res.length;
      } else if (res && Array.isArray(res.results)) {
        data = res.results;
        total = res.count || res.results.length;
      }
      setResults(data);
      setCount(total);
    };
    fetchData();
  }, [searchText, page]);

  // Track search activity
  useEffect(() => {
    if (searchText) {
      activityTracker.trackSearch(searchText, 'keyword');
    }
  }, [searchText]);

  return (
    <Page>
      <Box display="flex" height="100vh">
        {/* Sidebar */}
        <Box width={300} p={2} bgcolor="#fff" sx={{ borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            SDG Keywords
          </Typography>
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              label="Search keywords"
              size="small"
              fullWidth
              placeholder="Search..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Button onClick={() => setPage(1)} aria-label="Search">
              <SearchIcon />
            </Button>
          </Box>
          {/* 可扩展：目标筛选、参考文献筛选等 */}
        </Box>
        {/* Main Table */}
        <Box flex={1} p={2}>
          <Paper sx={{ width: '100%', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Keyword</TableCell>
                  <TableCell>SDG Goal</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Reference 1</TableCell>
                  <TableCell>Reference 2</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{row.keyword}</TableCell>
                    <TableCell>{row.sdggoal}</TableCell>
                    <TableCell>{row.target}</TableCell>
                    <TableCell>{row.reference1}</TableCell>
                    <TableCell>{row.reference2}</TableCell>
                    <TableCell>{row.note}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => setSelected(row)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Stack direction="row" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(count / PER_PAGE)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          </Paper>
        </Box>
      </Box>
      {/* 详情弹窗 */}
      {selected && (
        <PageModal buttonColour={PageButtonColour.Blue} buttonText="" >
          <Box p={2}>
            <Typography variant="h6">{selected.keyword}</Typography>
            <Typography>SDG Goal: {selected.sdggoal}</Typography>
            <Typography>Target: {selected.target}</Typography>
            <Typography>Reference 1: {selected.reference1}</Typography>
            <Typography>Reference 2: {selected.reference2}</Typography>
            <Typography>Note: {selected.note}</Typography>
            <Button onClick={() => setSelected(null)} sx={{ mt: 2 }}>Close</Button>
          </Box>
        </PageModal>
      )}
    </Page>
  );
};

export default SdgKeywordsSearch;
