import React, { useEffect } from 'react';
import Page from '../Components/Page';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { IconButton } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Bookmark from '../Components/Bookmark';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { apiCallGet, apiCallPost } from '../Utilities/ApiCalls';
import SearchSDGPlanModal from '../Components/SearchSDGPlanModal';

// Filters out bookmarks based on the filter
const handleBookmarks = (currentSearch: string, bookmarks: any[] = [], showActionBookmarks: boolean, showEducationBookmarks: boolean) => {
  let bookmarksList = bookmarks
                        .filter(suggestion => (suggestion.title || suggestion.actions).toLowerCase().includes(currentSearch.toLowerCase()))

  if (!showActionBookmarks) {
    bookmarksList = bookmarksList.filter(suggestion => (suggestion.type !== 'action'));
  }
  
  if (!showEducationBookmarks) {
    bookmarksList = bookmarksList.filter(suggestion => (suggestion.type !== 'education'));
  }

  return bookmarksList;

}

const Bookmarks = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [currentSearch, setCurrentSearch] = useState('');

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [selectedBookmark, setSelectedBookmark] = useState<any | null>(null);

  const [showActionBookmarks, setShowActionBookmarks] = useState(true);
  const [showEducationBookmarks, setShowEducationBookmarks] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      // Putting in bookmarks as data so it's not empty
      await Promise.all([
        await apiCallPost('api/auth/bookmark/set/', { bookmark: 'education-2' }, true),
        await apiCallPost('api/auth/bookmark/set/', { bookmark: 'education-3' }, true),
        await apiCallPost('api/auth/bookmark/set/', { bookmark: 'action-6' }, true),
        await apiCallPost('api/auth/bookmark/set/', { bookmark: 'action-7' }, true)
      ]);

      // Gets title of all bookmarks the user has
      const data = await apiCallGet('api/auth/bookmark/get/', true);

      const userBookmarks: any[] = [];

      for (const bookmark of data.bookmarks) {
        const [type, id] = bookmark.split('-');

        if (type === 'action') {
          const actionBookmark = await apiCallGet(`api/sdg-actions/retrieve?q=${encodeURIComponent(id)}`, false);
          if (typeof actionBookmark.sdgs === 'number') {
            actionBookmark.sdgs = [String(actionBookmark.sdgs)];
          }
          actionBookmark.type = 'action';
          userBookmarks.push(actionBookmark);
        } else if (type === 'education') {
          const educationBookmark = await apiCallGet(`api/sdg-education/retrieve?q=${encodeURIComponent(id)}`, false);
          if (typeof educationBookmark.sdgs_related === 'number') {
            educationBookmark.sdgs_related = [educationBookmark.sdgs_related];
          }
          educationBookmark.type = 'education';
          userBookmarks.push(educationBookmark);
        }
      }
      // userBookmarks has the info associated with all the bookmark titles
      setBookmarks(userBookmarks);
      
    }
    fetchBookmarks();
  }, [])

  // Removes bookmark if you press the red bookmark button
  const handleDelete = async (id: string, type: string) => {
    const deleteBookmark = type + '-' + id

    const data = await apiCallPost('api/auth/bookmark/unset/', { bookmark: deleteBookmark }, true);

    if (data.statusCode === 200) {
      setBookmarks(prev => prev.filter(b => !(b.id === id && b.type === type)));
    } else {
      console.log(data)
    }
  }

  return (
    <Page>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'column'
      }}>
        <Typography variant='h2' sx={{ fontSize: '30px', fontWeight: 'bold', paddingBottom: '20px' }}>Bookmarks</Typography>

        <TextField
          placeholder='Search your bookmarks'
          fullWidth
          onChange={(e) => setCurrentSearch(e.target.value)}
          sx={{
            backgroundColor: '#FFFFFF',
            padding: '5px',
            fontSize: '18px',
            borderRadius: '5px',
            boxSizing: 'border-box',
            '& fieldset': { border: 'none' },
            marginBottom: '20px',
            width: '50%'
          }}
          InputProps={{
            startAdornment:(
              <SearchIcon sx={{ marginRight: '10px' }} />
              ),
            endAdornment:(
              <IconButton aria-label="filter" onClick={handleClick}>
                <FilterAltIcon />
              </IconButton>
            )
          }}
        />
        <Menu
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <Typography pl={2}>Filter</Typography>
          <MenuItem>
            <FormControlLabel 
              control={<Checkbox checked={showActionBookmarks} onChange={(e) => setShowActionBookmarks(e.target.checked)} />} 
              label='Actions' 
            />
          </MenuItem>
          <MenuItem>
            <FormControlLabel 
              control={<Checkbox checked={showEducationBookmarks} onChange={(e) => setShowEducationBookmarks(e.target.checked)} />} 
              label='Education' 
            />
          </MenuItem>
        </Menu>

        <Box sx={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {
            handleBookmarks(currentSearch, bookmarks, showActionBookmarks, showEducationBookmarks).map((bookmark, index) => (
              <Bookmark 
                key={index} 
                bookmarkTitle={bookmark.title || bookmark.actions}  
                bookmarkType={bookmark.organization || 'Individual'} 
                sdgGoalNumbers={(bookmark.sdgs || bookmark.sdgs_related)}
                onClick={() => setSelectedBookmark(bookmark)}
                onDelete={() => handleDelete(bookmark.id, bookmark.type)}
              />
            ))
          }
        </Box>
      </Box>
      {selectedBookmark && (
        <SearchSDGPlanModal
          title={selectedBookmark.title || selectedBookmark.actions}
          aims={selectedBookmark.aims}
          descriptions={selectedBookmark.descriptions || selectedBookmark.action_detail}
          organisation={selectedBookmark.organization}
          sources={selectedBookmark.sources}
          links={selectedBookmark.links}
          onClose={() => setSelectedBookmark(null)}
          open={selectedBookmark !== null}
        />
      )}
    </Page>
  )
}

export default Bookmarks;
