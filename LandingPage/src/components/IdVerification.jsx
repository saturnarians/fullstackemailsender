import React, { useRef, useContext, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';

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

function IdVerification({ onNext }) {
  const [idSource, setIdSource] = useState("");
  const { setPhotoId } = useContext(AuthContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

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
    
    console.log('Captured Data URL:', dataUrl);  // Log the data URL to verify its format
    
    setIdSource(dataUrl);
    setPhotoId(dataUrl);
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
      setIdSource(newUrl);
      setPhotoId(newUrl);
    }
  };
  // const handleCapture = (target) => {
  //   if (target.files && target.files.length !== 0) {
  //     const file = target.files[0];
  //     const newUrl = URL.createObjectURL(file);
  //     setIdSource(newUrl);
  //     setPhotoId(newUrl);
  //   } else {
  //     console.error('No file selected or invalid file');
  //   }
  // };

  const dataURLtoBlob = (dataURL) => {
    if (!dataURL || !dataURL.startsWith('data:')) {
      console.error('Invalid Data URL:', dataURL);
      throw new Error('Invalid Data URL');
    }
  
    // Split the Data URL into its components
    const [header, data] = dataURL.split(',');
  
    // Extract the MIME type from the header
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'; // Fallback MIME type
  
    // Decode the base64 data
    const binary = atob(data);
    const array = [];
  
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
  
    return new Blob([new Uint8Array(array)], { type: mime });
  };
  
  // console.log('ID Source:', idSource);


  const handleSubmit = async () => {
    try {
      let blob;
      if (idSource.startsWith('data:')) {
        blob = dataURLtoBlob(idSource);
      } else if (idSource.startsWith('blob:')) {  // Handle the blob URL case
        const response = await fetch(idSource);
        blob = await response.blob();
      } else {
        throw new Error('Unsupported ID Source format');
      }
  
      const formData = new FormData();
      formData.append('idImage', blob, 'id_image.png');
  
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      console.log('Upload successful:', result);
      onNext(); // Proceed to the next step
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  
  

  return (
    <div>
      <div className="hidden 2xl:block">
        <Grid container>
          <Grid item xs={12}>
            <h5>Capture your ID</h5>
            {isCameraActive ? (
              <>
                <div className="relative mb-4">
                  <video ref={videoRef} className="w-full max-w-md" />
                  <canvas ref={canvasRef} className="hidden" width="400" height="300"></canvas>
                </div>
                <div className="flex justify-center mb-4">
                  <Button onClick={capturePhoto} variant="contained" color="primary">Capture ID</Button>
                </div>
              </>
            ) : (
              <Button onClick={startCamera} variant="contained" color="primary">Start Camera</Button>
            )}
            {idSource && (
              <div className="mt-4">
                <ImgBox>
                  <Img src={idSource} alt="Captured" />
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
            <h5>Capture your ID</h5>
            {idSource && (
              <ImgBox>
                <Img src={idSource} alt="snap" />
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
            {idSource && (
              <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '10px' }}>Submit</Button>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default IdVerification;
