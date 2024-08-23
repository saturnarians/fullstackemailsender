import React, { useRef, useContext, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Input = styled('input')({
  display: 'none',
});

const ImgBox = styled(Box)({
  maxWidth: "80%",
  maxHeight: "80%",
  margin: "10px",
  display: 'flex',
  justifyContent: 'center',
  border: '1px solid black',
});

const Img = styled('img')({
  height: 'inherit',
  maxWidth: 'inherit',
});

function CamVerification({ onNext }) {
  const [source, setSource] = useState("");
  const { setPhoto } = useContext(AuthContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [file, setFile] = useState(null);

  const startCamera = () => {
    setIsCameraActive(true);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(err => {
        console.error('Error accessing camera: ', err);
      });
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setSource(dataUrl);
    setPhoto(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const handleCapture = (target) => {
    if (target.files && target.files.length !== 0) {
      const file = target.files[0];
      const newUrl = URL.createObjectURL(file);
      setSource(newUrl);
      setPhoto(newUrl);
      setFile(file);
    }
  };

  const uploadImage = async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'captured_photo.png', { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload`, formData);
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = async () => {
    if (source) {
      await uploadImage(source);
      onNext();
    }
  };

  return (
    <div>
      {/* Desktop Version */}
      <div className="hidden 2xl:block">
        <Grid container>
          <Grid item xs={12} className='grid'>
            <h5 className='mb-4 text-center'>Capture your image!</h5>
            {isCameraActive ? (
              <>
                <div className="relative mb-4 place-self-center">
                  <video ref={videoRef} className="w-full max-w-md" />
                  <canvas ref={canvasRef} className="hidden" width="400" height="300"></canvas>
                </div>
                <div className="flex justify-center mb-4">
                  <Button onClick={capturePhoto} variant="contained" color="primary">Capture Photo</Button>
                </div>
              </>
            ) : (
              <Button onClick={startCamera} variant="contained" color="primary" className="place-self-center">
                Start Camera</Button>
            )}
            {source && (
              <div className="mt-4 place-self-center">
                <ImgBox>
                  <Img src={source} alt="Captured" />
                </ImgBox>
                <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
              </div>
            )}
          </Grid>
        </Grid>
      </div>

      {/* Mobile Version */}
      <div className="xl:hidden" style={{ height: '100%', textAlign: 'center' }}>
        <Grid container>
          <Grid item xs={12}>
            <h3 className='mb-4 font-semibold text-center text-blue-900'>Face Recognition</h3>
            <h5 className='mb-4 text-center'>Capture your image!</h5>
            {source && (
              <ImgBox>
                <Img src={source} alt="snap" />
              </ImgBox>
            )}
            <Input
              accept="image/*"
              id="icon-button-file"
              type="file"
              capture="environment"
              onChange={(e) => handleCapture(e.target)}
            />
            <label htmlFor="icon-button-file">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
              >
                <PhotoCameraRoundedIcon fontSize="large" />
              </IconButton>
            </label>
            {source && (
              <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '10px' }}>Submit</Button>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default CamVerification;
