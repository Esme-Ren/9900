import { useState } from 'react';
import { Box, Fade } from '@mui/material';
import { Typography } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SDGGoal1 from '../Assets/SDGTypes/SDGGoal1.png'
import SDGGoal2 from '../Assets/SDGTypes/SDGGoal2.png'
import SDGGoal3 from '../Assets/SDGTypes/SDGGoal3.png'
import SDGGoal4 from '../Assets/SDGTypes/SDGGoal4.png'
import SDGGoal5 from '../Assets/SDGTypes/SDGGoal5.png'
import SDGGoal6 from '../Assets/SDGTypes/SDGGoal6.png'
import SDGGoal7 from '../Assets/SDGTypes/SDGGoal7.png'
import SDGGoal8 from '../Assets/SDGTypes/SDGGoal8.png'
import SDGGoal9 from '../Assets/SDGTypes/SDGGoal9.png'
import SDGGoal10 from '../Assets/SDGTypes/SDGGoal10.png'
import SDGGoal11 from '../Assets/SDGTypes/SDGGoal11.png'
import SDGGoal12 from '../Assets/SDGTypes/SDGGoal12.png'
import SDGGoal13 from '../Assets/SDGTypes/SDGGoal13.png'
import SDGGoal14 from '../Assets/SDGTypes/SDGGoal14.png'
import SDGGoal15 from '../Assets/SDGTypes/SDGGoal15.png'
import SDGGoal16 from '../Assets/SDGTypes/SDGGoal16.png'
import SDGGoal17 from '../Assets/SDGTypes/SDGGoal17.png'
import IconButton from '@mui/material/IconButton';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import Tooltip from '@mui/material/Tooltip';

const sdgGoal = (goalNumber: string) => {
  switch (goalNumber) {
    case '1': return SDGGoal1
    case '2': return SDGGoal2
    case '3': return SDGGoal3
    case '4': return SDGGoal4
    case '5': return SDGGoal5
    case '6': return SDGGoal6
    case '7': return SDGGoal7
    case '8': return SDGGoal8
    case '9': return SDGGoal9
    case '10': return SDGGoal10
    case '11': return SDGGoal11
    case '12': return SDGGoal12
    case '13': return SDGGoal13
    case '14': return SDGGoal14
    case '15': return SDGGoal15
    case '16': return SDGGoal16
    case '17': return SDGGoal17
  }
}

const Bookmark = ({ bookmarkTitle, bookmarkType, sdgGoalNumbers, onClick, onDelete }: { bookmarkTitle: string, bookmarkType: string, sdgGoalNumbers: string[], onClick: () => void, onDelete: () => void }) => {

  const [hovering, setHovering] = useState(false);

  return (
    <Box 
      sx={{
        backgroundColor: 'white',
        borderRadius: '5px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '5px',
        cursor: 'pointer',
        width: '100%'
      }}
      onClick={onClick}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Tooltip title='Remove Bookmark' arrow slots={{ transition: Fade }}>
          <IconButton 
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            {
              hovering ? (
                <BookmarkRemoveIcon sx={{ color: 'red', fontSize: '30px' }} />
              ) : (
                  <BookmarkIcon sx={{ color: 'red', fontSize: '30px' }} />
              )
            }
          </IconButton>
        </Tooltip>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography variant='h6'>{bookmarkTitle}</Typography>
          <Typography variant='subtitle2' color={'#828282'}>{bookmarkType}</Typography>

        </Box>
      </Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        maxWidth: '30%',
        height: '100%'
      }}>
        {
          sdgGoalNumbers.map((sdg, index) => (
            <img 
            key={index} 
            src={sdgGoal(sdg)}
            alt={`SDG ${sdg}`}
            style={{
              width: '40px',
              objectFit: 'contain',
              borderRadius: '5px'
            }}
            />
          ))
        }
      </Box>
    </Box> 
  )
}

export default Bookmark;