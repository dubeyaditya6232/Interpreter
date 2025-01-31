import React from 'react'
import PropTypes from 'prop-types';

import AccordionGroup from '@mui/joy/AccordionGroup';
import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionSummary from '@mui/joy/AccordionSummary';
import { List, ListItem, ListItemButton } from '@mui/material';

const SpeechHistory = ({ chunks, getKeyWordSummarization }) => {
    return (
        <AccordionGroup sx={{ maxWidth: 400, bgcolor: 'grey' }}>
            {chunks?.map((chunk, index) => (
                <Accordion key={index}>
                    <AccordionSummary>{chunk.text}</AccordionSummary>
                    <AccordionDetails>
                        <List>
                            {chunk?.keywords?.map((keyword, index) => (
                                <ListItem key={index} sx={{ padding: 0, m: 0 }}>
                                    <ListItemButton

                                        onClick={() => getKeyWordSummarization(keyword)}
                                    >
                                        {keyword}
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}
        </AccordionGroup>
    )
}
SpeechHistory.propTypes = {
    chunks: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
        timeStamp: PropTypes.string
    })).isRequired,
    getKeyWordSummarization: PropTypes.func.isRequired
};

export default SpeechHistory