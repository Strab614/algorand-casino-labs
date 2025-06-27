import React from "react";

export interface Props {
  headsImg: string;
  tailsImg: string;
  result?: "heads" | "tails";
}

export const CoinFlip: React.FC<Props> = ({ headsImg, tailsImg, result }) => {
  return (
    <div className="coin-flip-container">
      <style>
        {`
          .coin-flip-container {
            perspective: 1200px;
          }

          .coin {
            position: relative;
            width: 200px;
            height: 200px;
            transform-style: preserve-3d;
            transform-origin: center;
          }

          .coin-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: linear-gradient(
              45deg,
              #FFD700,
              #FDB931 25%,
              #FFD700 50%,
              #FDB931 75%,
              #FFD700
            );
            transform-style: preserve-3d;
            box-shadow: 
              0 0 15px rgba(0, 0, 0, 0.6),
              inset 0 0 20px rgba(0, 0, 0, 0.3);
          }

          .heads {
            transform: rotateY(0deg) translateZ(8px);
          }

          .tails {
            transform: rotateY(180deg) translateZ(8px);
          }

          .coin img {
            width: 92%;
            height: 92%;
            object-fit: contain;
            border-radius: 50%;
            box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.4);
          }

          .coin.continuous-flip {
            animation: continuous-flip 4s linear infinite;
          }

          @keyframes continuous-flip {
            0% { 
              transform: rotateY(0deg) rotateX(-20deg) rotateZ(0deg);
            }
            20% {
              transform: rotateY(144deg) rotateX(-20deg) rotateZ(0deg);
            }
            40% {
              transform: rotateY(288deg) rotateX(-20deg) rotateZ(0deg);
            }
            60% {
              transform: rotateY(432deg) rotateX(-20deg) rotateZ(0deg);
            }
            80% {
              transform: rotateY(576deg) rotateX(-20deg) rotateZ(0deg);
            }
            100% { 
              transform: rotateY(720deg) rotateX(-20deg) rotateZ(0deg);
            }
          }
        `}
      </style>

      <div
        className={`coin ${!result ? "continuous-flip" : ""} ${result || ""}`}
      >
        <div className="coin-face heads">
          <img src={headsImg} alt="Heads" />
        </div>
        <div className="coin-face tails">
          <img src={tailsImg} alt="Tails" />
        </div>
      </div>
    </div>
  );
};
