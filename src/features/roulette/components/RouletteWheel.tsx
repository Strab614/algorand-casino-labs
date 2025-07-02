import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import './RouletteWheel.scss';

// Roulette wheel numbers in order (American roulette)
const ROULETTE_NUMBERS = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 37, 27,
  10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
];

// Red numbers in American roulette
const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

interface RouletteWheelProps {
  startSpinning?: boolean;
  winningNumber?: number;
  onSpinComplete?: (number: number) => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  startSpinning = false,
  winningNumber,
  onSpinComplete,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);

  useEffect(() => {
    if (startSpinning && !isSpinning) {
      startSpin();
    }
  }, [startSpinning, isSpinning]);

  useEffect(() => {
    if (winningNumber !== undefined && isSpinning) {
      stopSpinAtNumber(winningNumber);
    }
  }, [winningNumber, isSpinning]);

  const startSpin = () => {
    if (!wheelRef.current || !ballRef.current) return;

    setIsSpinning(true);
    setCurrentNumber(null);

    const wheel = wheelRef.current;
    const ball = ballRef.current;

    // Reset any previous animations
    wheel.style.transition = 'none';
    ball.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    ball.style.transform = 'rotate(0deg)';

    // Force reflow
    wheel.offsetHeight;
    ball.offsetHeight;

    // Start spinning animation
    wheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    ball.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';

    // Spin the wheel and ball in opposite directions
    const wheelRotation = 1440 + Math.random() * 720; // 4-6 full rotations
    const ballRotation = -(2160 + Math.random() * 720); // 6-8 full rotations opposite

    wheel.style.transform = `rotate(${wheelRotation}deg)`;
    ball.style.transform = `rotate(${ballRotation}deg)`;
  };

  const stopSpinAtNumber = (number: number) => {
    if (!wheelRef.current || !ballRef.current) return;

    const wheel = wheelRef.current;
    const ball = ballRef.current;

    // Find the index of the winning number
    const numberIndex = ROULETTE_NUMBERS.indexOf(number === 37 ? 0 : number); // 37 represents 00 in our system
    if (numberIndex === -1) return;

    // Calculate the angle for the winning number
    const anglePerNumber = 360 / ROULETTE_NUMBERS.length;
    const targetAngle = numberIndex * anglePerNumber;

    // Add extra rotations for dramatic effect
    const finalWheelRotation = 1440 + targetAngle;
    const finalBallRotation = -(2160 - targetAngle);

    // Apply final rotation with easing
    wheel.style.transition = 'transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)';
    ball.style.transition = 'transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)';

    wheel.style.transform = `rotate(${finalWheelRotation}deg)`;
    ball.style.transform = `rotate(${finalBallRotation}deg)`;

    // Set the current number and stop spinning after animation
    setTimeout(() => {
      setCurrentNumber(number);
      setIsSpinning(false);
      onSpinComplete?.(number);
    }, 2000);
  };

  const getNumberColor = (num: number): string => {
    if (num === 0 || num === 37) return 'green'; // 0 and 00
    return RED_NUMBERS.has(num) ? 'red' : 'black';
  };

  const renderWheelNumbers = () => {
    return ROULETTE_NUMBERS.map((number, index) => {
      const angle = (index * 360) / ROULETTE_NUMBERS.length;
      const displayNumber = number === 37 ? '00' : number.toString();
      
      return (
        <div
          key={index}
          className={`wheel-number ${getNumberColor(number)}`}
          style={{
            transform: `rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)`,
          }}
        >
          {displayNumber}
        </div>
      );
    });
  };

  return (
    <Box className="roulette-wheel-container">
      <div className="roulette-wheel" ref={wheelRef}>
        <div className="wheel-inner">
          {renderWheelNumbers()}
        </div>
        <div className="wheel-center">
          <div className="center-circle"></div>
        </div>
      </div>
      
      <div className="roulette-ball" ref={ballRef}>
        <div className="ball"></div>
      </div>
      
      <div className="wheel-pointer"></div>
      
      {currentNumber !== null && (
        <div className="winning-number-display">
          <div className={`winning-number ${getNumberColor(currentNumber)}`}>
            {currentNumber === 37 ? '00' : currentNumber}
          </div>
        </div>
      )}
    </Box>
  );
};

export default RouletteWheel;