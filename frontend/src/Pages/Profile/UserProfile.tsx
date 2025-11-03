import Page from '../../Components/Page';
import { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { Box } from '@mui/material';
import InputField from '../../Components/UserProfileInputField';
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ProfileCard from '../../Components/ProfileCard';
import { apiCallGet, apiCallPut } from '../../Utilities/ApiCalls';
import { useParams } from 'react-router-dom';
import UserDeleteModal from './UserDeleteModal';

const UserProfile = () => {
  const { targetUsername } = useParams();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [facultyMajor, setFacultyMajor] = useState('');
  const [gender, setGender] = useState('');
  const [language, setLanguage] = useState('');
  const [positions, setPositions] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [initialNumber, setInitialNumber] = useState('');
  const [initialOrganisation, setInitialOrganisation] = useState('');
  const [initialFacultyMajor, setInitialFacultyMajor] = useState('');
  const [initialGender, setInitialGender] = useState('');
  const [initialLanguage, setInitialLanguage] = useState('');
  const [initialPositions, setInitialPositions] = useState('');
  
  const [editing, setEditing] = useState(false);
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [key, setKey] = useState(0);

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};
  
    if (!firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!email?.trim()) newErrors.email = 'Email is required';
    if (!username?.trim()) newErrors.username = 'Username is required';
    if (!organisation?.trim()) newErrors.organisation = 'Organisation is required';
    if (!facultyMajor?.trim()) newErrors.facultyMajor = 'Faculty & Major is required';
    if (!gender?.trim()) newErrors.gender = 'Gender is required';
    if (!language?.trim()) newErrors.language = 'Language is required';
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  useEffect(() => {
    const getData = async () => {
      if (targetUsername) {
        return await apiCallGet('api/auth/profile/' + targetUsername + '/', true);
      }
      return await apiCallGet('api/auth/profile/', true);
    }

    const fetchData = async () => {
      const data = await getData();
      setUsername(data.username);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setEmail(data.email);
      setNumber(data.mobile);
      setOrganisation(data.organization);
      setFacultyMajor(data.faculty_and_major);
      setGender(data.gender || '');
      setLanguage(data.language || '');
      setPositions(data.positions || '');

      setInitialFirstName(data.first_name);
      setInitialLastName(data.last_name);
      setInitialEmail(data.email);
      setInitialNumber(data.mobile);
      setInitialOrganisation(data.organization);
      setInitialFacultyMajor(data.faculty_and_major);
      setInitialGender(data.gender || '');
      setInitialLanguage(data.language || '');
      setInitialPositions(data.positions || '');
    }
    fetchData();
  }, [targetUsername])

  
  
  const updateUserDetails = async () => {
    if (!validateProfileForm()) return;

    const updatedData = {
      username: username,
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile: number,
      organization: organisation,
      faculty_and_major: facultyMajor,
      gender,
      language,
      positions,
    };
    
    const data = await apiCallPut('api/auth/profile/', updatedData, true);

    setInitialFirstName(data.first_name);
    setInitialLastName(data.last_name);
    setInitialEmail(data.email);
    setInitialNumber(data.mobile);
    setInitialOrganisation(data.organization);
    setInitialFacultyMajor(data.faculty_and_major);
    setInitialGender(data.gender);
    setInitialLanguage(data.language);
    setInitialPositions(data.positions);

    // If all details can be saved
    toggleEditing();

  }

  const toggleEditing = () => {
    setEditing(!editing);
  }

  const handleCancel = () => {
    // Change back to inital inputs
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setEmail(initialEmail);
    setNumber(initialNumber);
    setOrganisation(initialOrganisation);
    setFacultyMajor(initialFacultyMajor);
    setGender(initialGender);
    setLanguage(initialLanguage);
    setPositions(initialPositions);

    setKey(prev => prev + 1);

    toggleEditing();
  };

  return (
    <Page center>
      <Box sx={{ 
        mx: 'auto',
        width: '100%', 
        height: '100%', 
        padding: 3, 
        display: 'flex', 
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        flexDirection: isSmallScreen ? 'column' : 'row'
        
      }}>
        <ProfileCard username={username}/>
        
        <Box 
          key={key} 
          sx={{
            flexGrow: 1,
            height: '100%',
            display: 'flex'
          }}
        >
          <Box sx={{
            width: '50%',
            height: '100%',
            minWidth: '30px',
            minHeight: '30px',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            <InputField 
              name='Username *' 
              value={username} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              editing={false}
              noDefault
              error={!!errors.Username}
              helperText={errors.Username || ''} 
            />
            <InputField 
              name='First Name *' 
              value={firstName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
              editing={editing}
              noDefault
              error={!!errors.firstName}
              helperText={errors.firstName || ''} 
            />
            <InputField 
              name='Last Name *' 
              value={lastName} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
              editing={editing}
              noDefault
              error={!!errors.lastName}
              helperText={errors.lastName || ''} 
            />
            <InputField 
              name='Email *' 
              value={email} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              editing={editing}
              noDefault
              error={!!errors.email}
              helperText={errors.email || ''} 
            />
            <InputField
              name='Gender *'
              value={gender} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGender(e.target.value)} 
              editing={editing} 
              noDefault 
              error={!!errors.gender}
              helperText={errors.gender || ''} 
            />
          </Box>
          
          <Box sx={{
            width: '50%',
            height: '100%',
            minWidth: '30px',
            minHeight: '30px',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <InputField 
              name='Phone Number' 
              value={number} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumber(e.target.value)}
              editing={editing}
              noDefault
            />
            <InputField 
              name='Organisation *' 
              value={organisation} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrganisation(e.target.value)}
              editing={editing}
              noDefault
              error={!!errors.organisation}
              helperText={errors.organisation || ''} 
            />
            <InputField 
              name='Faculty and Major *' 
              value={facultyMajor} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFacultyMajor(e.target.value)}
              editing={editing}
              noDefault
              error={!!errors.facultyMajor}
              helperText={errors.facultyMajor || ''} 
            />
            <InputField
              name='Language *'
              value={language} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLanguage(e.target.value)} 
              editing={editing} 
              noDefault 
              error={!!errors.language}
              helperText={errors.language || ''} 
            />
            <InputField
              name='Positions'
              value={positions} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPositions(e.target.value)} 
              editing={editing} 
              noDefault 
            />
            <Box 
              sx={{ 
                marginTop: '30px',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              { !targetUsername && (editing ? (
                <Box sx={{ display: 'flex', gap: '10px' }}>
                  <PageButton colour={PageButtonColour.Red} onClick={handleCancel}>Cancel</PageButton>
                  <PageButton colour={PageButtonColour.Green} startIcon={<SaveIcon />} onClick={updateUserDetails}>Save</PageButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: '10px' }}>
                  <UserDeleteModal name={username} />
                  <PageButton colour={PageButtonColour.Blue} startIcon={<EditIcon />} onClick={toggleEditing}>Edit</PageButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default UserProfile;