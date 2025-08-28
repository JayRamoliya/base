import { useEffect } from 'react';

const NotificationSound = ({ play = false, type = 'success' }) => {
  useEffect(() => {
    if (play) {
      // Create audio context and play notification sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different sounds for different notification types
        const frequencies = {
          success: [800, 1000, 1200],
          error: [400, 300, 200],
          warning: [600, 800, 600],
          info: [700, 900, 1100]
        };
        
        const freqArray = frequencies[type] || frequencies.success;
        
        freqArray.forEach((freq, index) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.2);
          }, index * 100);
        });
        
      } catch (error) {
        console.log('Audio not supported or blocked by browser');
      }
    }
  }, [play, type]);

  return null;
};

export default NotificationSound;