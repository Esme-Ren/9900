import Page from '../Components/Page';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import TypedSearchSuggestion from '../Components/TypedSearchSuggestion';
import { TextField } from '@mui/material';
import { apiCallGet, apiCallPost } from '../Utilities/ApiCalls';
import SearchIcon from '@mui/icons-material/Search';
import SearchSDGPlanModal from '../Components/SearchSDGPlanModal';

const getRecentSearches = async () => {

  const userDetails = localStorage.getItem('userDetails');
  const token = localStorage.getItem('token');
  
  if (!userDetails) {
    return []
  }

  if (!token) {
    return []
  }
  
  const user = JSON.parse(userDetails);

  const data = await apiCallGet(`api/admin/user/${user.id}/userInteractions/`, true);
  if (data) {
    const actionPlans = data.action_plans_viewed || [];
    const educationPlans = data.education_plans_viewed || [];
    const temp = actionPlans.concat(educationPlans);
    return temp.slice(0,2);
  } 
  
  return []

}

const getTrendingSearches = async () => {

  // Putting in view counts as data so it's not empty
  await Promise.all([
    apiCallPost('api/admin/log/education/', { educationId: 1 }, false),
    apiCallPost('api/admin/log/education/', { educationId: 3 }, false),
    apiCallPost('api/admin/log/education/', { educationId: 4 }, false),
    apiCallPost('api/admin/log/education/', { educationId: 5 }, false),
    apiCallPost('api/admin/log/action/', { actionId: 1 }, false),
    apiCallPost('api/admin/log/action/', { actionId: 5 }, false)
  ]);

  // Get trending searches
  const [educationData, actionsData] = await Promise.all([
    apiCallPost('api/admin/analytics/educations/top/', {}, false),
    apiCallPost('api/admin/analytics/actions/top/', {}, false)
  ]);

  const educationPlans = Object.values(educationData)
    .map((educationPlan: any) => educationPlan.educationName)
    .slice(0, 2);

  const actionPlans = Object.values(actionsData)
    .map((actionPlan: any) => actionPlan.actionName)
    .slice(0, 2);

  const educationTrendingSearches = [];
  const actionTrendingSearches = [];
  
  for (const title of educationPlans) {
    const educationResponse = await apiCallGet(`api/sdg-education/search?q=${encodeURIComponent(title)}`, false);
    educationTrendingSearches.push(educationResponse[0]);
  }


  for (const title of actionPlans) {
    const actionResponse = await apiCallGet(`api/sdg-actions/search?q=${encodeURIComponent(title)}`, false);
    actionTrendingSearches.push(actionResponse[0]);
  }

  const trendingSearches = [...educationTrendingSearches, ...actionTrendingSearches];

  return trendingSearches;
}

const SearchKeyword = () => {

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<any[]>([]);
  const [currentSearch, setCurrentSearch] = useState('');
  const [suggestedSearches, setSuggestedSearches] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false); 
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  useEffect(() => {
    const fetchSearchData = async () => {
      const recent = await getRecentSearches();
      const trending = await getTrendingSearches();
      setRecentSearches(recent);
      setTrendingSearches(trending);
    };

    fetchSearchData();
  }, []);

  useEffect(() => {
    const getSuggestedSearches = async () => {

      if (!currentSearch) {
        return;
      }

      const [educationData, actionsData] = await Promise.all([
        apiCallGet(`api/sdg-education/search?q=${encodeURIComponent(currentSearch)}`, false),
        apiCallGet(`api/sdg-actions/search?q=${encodeURIComponent(currentSearch)}`, false)
      ]);

      const educationPlans = Object.values(educationData).filter((educationPlan: any) => educationPlan.title);

      const actionPlans = Object.values(actionsData).filter((actionPlan: any) => actionPlan.title);

      const suggestions = [...educationPlans, ...actionPlans].slice(0, 5);

      setSuggestedSearches(suggestions);

    };
  
    getSuggestedSearches();
  }, [currentSearch]);

  useEffect(() => {
    if (selectedPlan) {
      console.log('Selected Plan has changed:', selectedPlan);
    }
  }, [selectedPlan]);

  return (
    <Page>
      <Box sx={{
        mx: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flexDirection: 'column',
        marginTop: '80px'
      }}>
        <Typography variant='h3' sx={{
          color: '#4285F4',
          fontWeight: 'bold',
          paddingBottom: '50px',
          textAlign: 'center'
        }}>SDG Knowledge System</Typography>
        <TextField
          placeholder='Search for an SDG Action/Education Plan'
          variant='outlined'
          autoComplete='off'
          fullWidth
          onChange={(e) => setCurrentSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          sx={{
            backgroundColor: 'white',
            width: { xs: '100%', sm: '60%' },
            padding: '5px',
            fontSize: '18px',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            borderBottomLeftRadius: isFocused ? '0px' : '5px',
            borderBottomRightRadius: isFocused ? '0px' : '5px',
            boxSizing: 'border-box',
            '& fieldset': { border: 'none' },
            
          }}
          InputProps={{
            startAdornment:(
              <SearchIcon sx={{ marginLeft: '10px', marginRight: '30px', color: '#757575' }}/>
            )
          }}
        />

        {isFocused &&
          <Box sx={{
            width: { xs: '100%', sm: '60%' },
            padding: '10px',
            backgroundColor: 'white',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            flexGrow: 1
          }}>
            {!currentSearch ? (
              <>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap'
                }}>
                  {recentSearches.length > 1 && recentSearches.map((search, index) => (
                    <TypedSearchSuggestion 
                      key={index} 
                      search={search} 
                      iconType='history' 
                      onClick={() => console.log('Search word clicked')}
                    />
                  ))}
                </Box>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap'
                }}>
                  {trendingSearches.map((search, index) => (
                    <TypedSearchSuggestion 
                      key={index} 
                      search={search.title || search.actions} 
                      iconType='trending' 
                      onClick={() => {setSelectedPlan(search)}}
                      isLast={index === trendingSearches.length - 1} 
                      type={search.type}
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap'
              }}>
                {suggestedSearches.map((search, index) => (
                  <TypedSearchSuggestion 
                    key={index} 
                    search={search.title || search.actions} 
                    iconType='search' 
                    onClick={() => {setSelectedPlan(search)}}
                    type={search.type}
                  />
                ))}
              </Box>
            )}
          </Box>
        }
        </Box>
      {selectedPlan && (
        <SearchSDGPlanModal
          title={selectedPlan.title || selectedPlan.actions}
          aims={selectedPlan.aims}
          descriptions={selectedPlan.descriptions || selectedPlan.action_detail}
          organisation={selectedPlan.organization}
          sources={selectedPlan.sources}
          links={selectedPlan.links}
          onClose={() => setSelectedPlan(null)}
          open={selectedPlan !== null}
        />
      )}
    </Page>
  );
}

export default SearchKeyword;
