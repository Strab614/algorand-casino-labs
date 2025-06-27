import { Box } from "@mui/material";
import "./RouletteWheel.scss";
import { useEffect, useRef, useState } from "react";
import { RouletteNumbers, RouletteWheelAnimation } from "../types";

//const stopSound = new Audio("/audio/roulette/stop.wav");

interface RouletteWheelProps {
  startSpinning: boolean;
  /**
   * The winning number of the roulette game.
   * If provided, the wheel will animate to that number otherwise will show a continuous spinning animation (while waiting for a the result)
   */
  winningNumber?: number;
}

export const RouletteWheel = ({
  startSpinning,
  winningNumber,
}: RouletteWheelProps) => {
  const [ball, setBall] = useState<HTMLImageElement | null>(null);

  const rouletteRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<SVGGElement>(null);

  // useRef to store the requestAnimationFrame ID
  const requestId = useRef<number | null>(null);
  // animation state
  const animationRef = useRef<RouletteWheelAnimation | null>(null);

  /**
   * Calculates the next step in the animation based on the current stage.
   */
  const calculateAnimation = () => {
    // get animation from ref
    const animation = animationRef.current!;

    switch (animation.animationStage) {
      case 1:
        animation.ballSpeed = animation.wheelSpeed;
        animation.ballPosition +=
          (animation.gameTime - animation.animationTime) * 0.45;
        // eslint-disable-next-line no-var
        var p = (100 * (animation.ballPosition - 120)) / (223 - 120);
        if (p > 50) p = 100 - p;
        animation.ballScale = 1 + p / 150;
        if (animation.ballPosition >= 223) {
          animation.ballPosition = 223;
          animation.ballScale = 1;
          animation.animationStage++;
        }
        break;
      case 2:
        animation.wheelSpeed +=
          (animation.gameTime - animation.animationTime) * 0.00001;
        if (animation.wheelSpeed >= 0.001) {
          animation.wheelSpeed = 0.001;
          animation.animationStage++;
        }
        animation.ballSpeed = -animation.wheelSpeed;
        break;
      case 3:
        animation.ballSpeed +=
          (animation.gameTime - animation.animationTime) * 0.0001;
        if (animation.ballSpeed >= 0.009) {
          animation.ballSpeed = 0.009;
          animation.animationStage++;
        }
        break;
      case 4: {
        const wn = winningNumber;

        if (wn !== undefined) {
          console.log("Winning number: ", wn);

          animation.animationStage += 2;
          animation.ballIdx = RouletteNumbers.indexOf(wn);
          animation.ballNum = wn;
        }
        break;
      }
      case 6: {
        const v =
          6 * Math.PI -
          ((Math.PI * 2) / 38) * animation.ballIdx -
          animation.ballAngle;
        animation.ballAngleOri = animation.ballAngle;
        animation.ballBreakDist = v;
        animation.ballBreakAccl = (0.009 * 0.009) / (2 * v);
        animation.ballBreakTime = animation.gameTime;
        animation.animationStage++;
        animation.ballSpeed = 0;
        break;
      }
      case 7: {
        const s =
          0.009 * (animation.gameTime - animation.ballBreakTime) -
          (animation.ballBreakAccl *
            (animation.gameTime - animation.ballBreakTime) *
            (animation.gameTime - animation.ballBreakTime)) /
            2;
        animation.ballPosition =
          223 - (s / animation.ballBreakDist) * (223 - 140);
        animation.ballAngle = animation.ballAngleOri + s;
        if (
          s >=
          animation.ballBreakDist -
            (Math.PI * 2) / 38 / 2 -
            ((Math.PI * 2) / 38) * 6
        ) {
          animation.animationStage++;
          animation.ballPosition =
            360 - (s / animation.ballBreakDist) * (360 - 130);
          //this.soundStop(spinSound);
          // this.sound(stopSound);
        }
        if (s < 0) stopAnimation();
        break;
      }
      case 8: {
        const s =
          0.009 * (animation.gameTime - animation.ballBreakTime) -
          (animation.ballBreakAccl *
            (animation.gameTime - animation.ballBreakTime) *
            (animation.gameTime - animation.ballBreakTime)) /
            2;
        animation.ballPosition =
          360 - (s / animation.ballBreakDist) * (360 - 130);
        animation.ballAngle = animation.ballAngleOri + s;
        if (
          s >=
          animation.ballBreakDist -
            (Math.PI * 2) / 38 / 2 -
            ((Math.PI * 2) / 38) * 2
        ) {
          animation.animationStage++;
          animation.ballPosition =
            460 - (s / animation.ballBreakDist) * (460 - 125);
        }
        if (s < 0) stopAnimation();
        break;
      }
      case 9: {
        const s =
          0.009 * (animation.gameTime - animation.ballBreakTime) -
          (animation.ballBreakAccl *
            (animation.gameTime - animation.ballBreakTime) *
            (animation.gameTime - animation.ballBreakTime)) /
            2;
        animation.ballPosition =
          360 - (s / animation.ballBreakDist) * (360 - 125);
        animation.ballAngle = animation.ballAngleOri + s;
        if (
          s >=
          animation.ballBreakDist -
            (Math.PI * 2) / 38 / 2 -
            ((Math.PI * 2) / 38) * 1
        ) {
          animation.animationStage++;
          animation.ballPosition =
            260 - (s / animation.ballBreakDist) * (260 - 120);
        }
        if (s < 0) stopAnimation();
        break;
      }
      case 10: {
        const s =
          0.009 * (animation.gameTime - animation.ballBreakTime) -
          (animation.ballBreakAccl *
            (animation.gameTime - animation.ballBreakTime) *
            (animation.gameTime - animation.ballBreakTime)) /
            2;
        animation.ballPosition =
          260 - (s / animation.ballBreakDist) * (260 - 120);
        animation.ballAngle = animation.ballAngleOri + s;
        if (s >= animation.ballBreakDist - 0.07) {
          animation.ballAngle =
            animation.ballAngleOri + animation.ballBreakDist;
          animation.animationStage++;
          animation.ballPosition = 120;
        }
        if (s < 0) stopAnimation();
        break;
      }
      case 11:
        setTimeout(() => {
          // this.showResult();
          console.log("Show result call num won: " + animation.ballNum);
        }, 500);
        animation.animationStage++;
        break;
      case 12:
        animation.wheelSpeed -=
          (animation.gameTime - animation.animationTime) * 0.000001;
        if (animation.wheelSpeed <= 0) {
          animation.wheelSpeed = 0;
          animation.animationStage++;
        }
        break;
    }

    // update with new animation state
    animationRef.current = animation;
  };

  // stops the animation entirely
  const stopAnimation = () => {
    if (requestId.current !== null) {
      cancelAnimationFrame(requestId.current);
      requestId.current = null;
    }
  };

  const startAnimation = (resume?: boolean) => {
    if (!resume) {
      // set initial animation state
      animationRef.current = {
        isWorking: false,
        ballAngle: 0,
        ballPosition: 120, // distance from the center of the wheel - 120 = on number, 223 = top
        ballScale: 1, // scale of the ball
        ballSpeed: 0,
        animationStage: 1,
        wheelSpeed: 0,
        wheelAngle: 0,
        gameTime: Date.now(),
        animationTime: Date.now(),
        ballNum: 0,
        ballIdx: 0,
        ballAngleOri: 0,
        ballBreakDist: 0,
        ballBreakAccl: 0,
        ballBreakTime: 0,
      };
    }

    const animate = () => {
      const animation = animationRef.current!;

      const ctx = rouletteRef.current?.getContext("2d");

      if (ctx && ball && rouletteRef.current && wheelRef.current && animation) {
        if (animation.isWorking) {
          return;
        }
        animation.isWorking = true;

        animation.animationTime = animation.gameTime;
        animation.gameTime = Date.now();

        // clear the canvas
        ctx.clearRect(
          0,
          0,
          rouletteRef.current.width,
          rouletteRef.current.height
        );

        // rotate wheel
        if (animation.wheelSpeed > 0) {
          animation.wheelAngle +=
            (animation.gameTime - animation.animationTime) *
            animation.wheelSpeed;
          while (animation.wheelAngle > Math.PI * 2) {
            animation.wheelAngle -= Math.PI * 2;
          }

          wheelRef.current.style.transform = `rotate(${
            animation.wheelAngle + Math.PI
          }rad)`;
        }

        ctx.save();
        ctx.translate(240, 240);
        ctx.rotate(animation.wheelAngle);
        ctx.translate(-240, -240);

        if (animation.ballSpeed !== 0) {
          animation.ballAngle +=
            (animation.gameTime - animation.animationTime) *
            animation.ballSpeed;
          while (animation.ballAngle > Math.PI * 2) {
            animation.ballAngle -= Math.PI * 2;
          }

          while (animation.ballAngle < -Math.PI * 2) {
            animation.ballAngle += Math.PI * 2;
          }
        }

        // draw the ball on canvas
        ctx.drawImage(
          ball,
          240 -
            Math.sin(animation.ballAngle) * animation.ballPosition -
            8 * animation.ballScale,
          240 -
            Math.cos(animation.ballAngle) * animation.ballPosition -
            8 * animation.ballScale,
          16 * animation.ballScale,
          16 * animation.ballScale
        );

        // motion blur effect
        if (animation.ballSpeed > 0.002) {
          for (
            let i = 0;
            i < Math.round((10000 * (animation.ballSpeed - 0.002)) / 3);
            i++
          ) {
            ctx.globalAlpha = 0.15;
            ctx.drawImage(
              ball,
              240 -
                Math.sin(animation.ballAngle - i * 0.02) *
                  animation.ballPosition -
                8 * animation.ballScale,
              240 -
                Math.cos(animation.ballAngle - i * 0.02) *
                  animation.ballPosition -
                8 * animation.ballScale,
              16 * animation.ballScale,
              16 * animation.ballScale
            );
          }
        }

        ctx.globalAlpha = 1;
        ctx.restore();
        calculateAnimation();

        // update the animation state
        animationRef.current = animation;

        animation.isWorking = false;
      }

      requestId.current = requestAnimationFrame(animate);
    };

    // only if not already animating
    if (requestId.current === null) {
      requestId.current = requestAnimationFrame(animate);
    }
  };

  // just some skeleton
  useEffect(() => {
    if (winningNumber === undefined) {
      const ball = new Image();

      ball.onload = () => {
        setBall(ball);
      };

      ball.src = "images/roulette/ball.png";
    } else {
      // have a winning number
      // pause the animation, then restart it
      // this is so it picks up the new winningNumber prop
      stopAnimation();
      // resume
      startAnimation(true);
    }

    return () => {
      // stopAnimation
      stopAnimation();
    };
  }, [winningNumber]);

  useEffect(() => {
    if (ball && startSpinning) {
      startAnimation();
    }
  }, [ball, startSpinning]);

  return (
    <Box component={"div"}>
      <div className="roulette">
        <canvas ref={rouletteRef} width="480" height="480" />
        <object className="roulette-source">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 830 830"
          >
            <g
              ref={wheelRef}
              style={{
                transformOrigin: "center",
                transform: "rotate(3.14rad)",
              }}
            >
              <circle className="st0" cx="416.2" cy="414.9" r="97" />
              <path
                //"rouletteCell0"
                className="st3"
                d="M447.6,825.1c-11.1,0.9-22.3,1.3-33.6,1.3c-11.6,0-23-0.5-34.4-1.4l8.9-107.6c4.6,0.4,9.2,0.7,13.9,0.9 c3.8,0.1,7.7,0.2,11.5,0.2c8.4-0.1,16.6-0.4,24.8-1.1l0,0L447.6,825.1z"
              />
              <path
                //"rouletteCell1"
                className="st2"
                d="M388.5,717.4L379.6,825c-17.5-1.5-34.7-4-51.5-7.6c-5.2-1.1-10.4-2.3-15.5-3.6l0,0l26.5-104.6 c3.9,1,7.8,1.9,11.7,2.8C363.1,714.5,375.7,716.4,388.5,717.4L388.5,717.4z"
              />
              <path
                //"rouletteCell2"
                className="st1"
                d="M339.1,709.2l-26.5,104.6c-22.2-5.6-43.6-13.1-64.2-22.1l0,0l43.4-98.9c3.4,1.5,6.8,2.9,10.2,4.3 C313.9,701.9,326.3,705.9,339.1,709.2L339.1,709.2z"
              />
              <path
                //"rouletteCell3"
                className="st2"
                d="M291.7,692.8l-43.4,98.9c-17.1-7.5-33.6-16.2-49.3-25.8c-3.5-2.1-7-4.3-10.4-6.6l59.1-90.4 c2.6,1.7,5.2,3.4,7.9,5.1C267.2,681,279.2,687.3,291.7,692.8L291.7,692.8z"
              />
              <path
                //"rouletteCell4"
                className="st1"
                d="M247.7,668.8l-59.1,90.4c-19-12.4-36.9-26.4-53.6-41.8l73.2-79.5c1.9,1.8,3.8,3.5,5.8,5.2 C224.6,652.5,235.9,661,247.7,668.8z"
              />
              <path
                //"rouletteCell5"
                className="st2"
                d="M208.3,638l-73.2,79.5c-14.7-13.5-28.4-28.1-41-43.7c-1.7-2.1-3.4-4.2-5-6.3l85.3-66.4 c1.3,1.6,2.5,3.2,3.8,4.8C187.5,617.4,197.5,628.1,208.3,638z"
              />
              <path
                //"rouletteCell6"
                className="st1"
                d="M174.4,601.1l-85.3,66.4c-13.9-17.8-26.4-36.8-37.2-56.8l95.1-51.4c0.7,1.4,1.5,2.7,2.2,4.1 C156.7,576.6,165.1,589.2,174.4,601.1z"
              />
              <path
                //"rouletteCell7"
                className="st2"
                d="M51.9,610.7L51.9,610.7c-10.7-19.8-19.9-40.6-27.3-62.2l102.3-35.1c0.3,0.9,0.6,1.8,0.9,2.6 c5.3,15,11.7,29.4,19.2,43.2L51.9,610.7z"
              />
              <path
                //"rouletteCell8"
                className="st1"
                d="M126.9,513.4L126.9,513.4L24.6,548.5c-7.3-21.2-12.9-43.2-16.6-65.9l106.5-17.8l0,0c0.1,0.8,0.3,1.6,0.4,2.3 C117.7,483.1,121.7,498.4,126.9,513.4z"
              />
              <path
                //"rouletteCell9"
                className="st2"
                d="M8,482.6L8,482.6c-3.7-22-5.5-44.6-5.5-67.7h108l0,0c0,17,1.4,33.7,4.1,49.9L8,482.6z"
              />
              <path
                //"rouletteCell10"
                className="st1"
                d="M114.6,365L114.6,365c-2.7,16.2-4.1,32.8-4.1,49.8v0.1H2.5l0,0c0-23,1.9-45.6,5.6-67.7L114.6,365z"
              />
              <path
                //"rouletteCell11"
                className="st2"
                d="M126.8,316.5c-5.1,15.1-9.1,30.6-11.9,46.6c-0.1,0.6-0.2,1.3-0.3,2L8.1,347.3c3.8-22.6,9.4-44.6,16.6-65.8 L126.8,316.5z"
              />
              <path
                //"rouletteCell12"
                className="st1"
                d="M147,270.6C147,270.6,147,270.7,147,270.6c-7.3,13.6-13.7,27.8-19,42.5c-0.4,1.1-0.8,2.3-1.2,3.4L24.7,281.4 c0.5-1.5,1-2.9,1.5-4.4c7.1-20,15.8-39.3,25.8-57.8L147,270.6z"
              />
              <path
                //"rouletteCell13"
                className="st2"
                d="M174.4,228.8L174.4,228.8c-9.1,11.7-17.3,24-24.7,36.9c-0.9,1.7-1.8,3.3-2.7,5l-95-51.4 c10.8-20,23.3-39,37.2-56.8L174.4,228.8z"
              />
              <path
                //"rouletteCell14"
                className="st1"
                d="M208.3,191.9L208.3,191.9c-10.7,9.8-20.6,20.4-29.8,31.7c-1.4,1.7-2.8,3.4-4.1,5.2l-85.3-66.4 c13.9-17.9,29.3-34.6,46-50L208.3,191.9z"
              />
              <path
                //"rouletteCell15"
                className="st2"
                d="M247.8,161.1C247.8,161.1,247.7,161.1,247.8,161.1c-11.5,7.6-22.6,15.9-33,25c-2.2,1.9-4.4,3.8-6.5,5.8 l-73.2-79.5l0,0l0,0c16.6-15.4,34.5-29.3,53.5-41.8l0,0L247.8,161.1z"
              />
              <path
                //"rouletteCell16"
                className="st1"
                d="M291.7,137.1L291.7,137.1c-12.5,5.5-24.6,11.8-36.1,19c-2.6,1.6-5.3,3.3-7.8,5l-59.1-90.5l0,0 c3.4-2.2,6.9-4.4,10.4-6.6c15.8-9.7,32.3-18.4,49.3-25.9L291.7,137.1z"
              />
              <path
                //"rouletteCell17"
                className="st2"
                d="M339.1,120.8L339.1,120.8L339.1,120.8c-12.9,3.3-25.4,7.4-37.6,12.2c-3.3,1.3-6.5,2.7-9.8,4.1l-43.4-98.9 c20.6-9.1,42.1-16.5,64.3-22.1L339.1,120.8z"
              />
              <path
                //"rouletteCell18"
                className="st1"
                d="M388.5,112.5L388.5,112.5L388.5,112.5c-12.7,1.1-25.2,2.9-37.4,5.5c-4,0.9-8,1.8-12,2.8l0,0L312.6,16 c5.1-1.3,10.3-2.5,15.5-3.6c16.8-3.6,34-6.1,51.5-7.6l0,0L388.5,112.5z"
              />
              <path
                //"rouletteCell19"
                className="st3"
                d="M447.6,4.8l-8.9,107.6l0,0l0,0c-8.1-0.6-16.2-1-24.5-1c-3.6,0-7.2,0.1-10.8,0.2c-5,0.2-9.9,0.5-14.9,0.9l0,0 L379.6,4.9l0,0c11.4-1,22.8-1.5,34.4-1.5C425.3,3.4,436.5,3.9,447.6,4.8z"
              />
              <path
                //"rouletteCell20"
                className="st1"
                d="M514.6,15.9l-26.5,104.6l0,0l0,0c-11.1-2.8-22.4-4.9-33.9-6.5c-5.2-0.7-10.4-1.2-15.6-1.6l0,0l8.9-107.6 c6.8,0.5,13.7,1.3,20.4,2.1C483.8,9,499.4,12,514.6,15.9z"
              />
              <path
                //"rouletteCell21"
                className="st2"
                d="M579,37.9L579,37.9l-43.3,98.8l0,0c-9.9-4.3-20.1-8.2-30.5-11.5c-5.6-1.7-11.2-3.3-16.9-4.7l0,0l26.5-104.6 c7.5,1.9,14.9,4,22.3,6.3C551.3,26.6,565.3,31.9,579,37.9z"
              />
              <path
                //"rouletteCell22"
                className="st1"
                d="M638.8,70.2l-59,90.3l0,0c-9.1-6-18.6-11.5-28.4-16.4c-5.2-2.6-10.4-5.1-15.8-7.4l0,0L579,37.9l0,0 C599.9,47,619.9,57.9,638.8,70.2z"
              />
              <path
                //"rouletteCell23"
                className="st2"
                d="M692.5,112L692.5,112l-73.1,79.4l0,0c-7.7-7.1-15.8-13.8-24.3-20.2c-5-3.7-10.1-7.3-15.3-10.7l0,0l59-90.3 C657.9,82.7,675.8,96.7,692.5,112z"
              />
              <path
                //"rouletteCell24"
                className="st1"
                d="M738.6,162L738.6,162l-85.2,66.3l0,0c-6.4-8.2-13.2-16-20.3-23.5c-4.4-4.6-9-9.1-13.7-13.4l0,0l73.1-79.4l0,0 c6.3,5.8,12.5,11.9,18.4,18.1C720.7,140.2,729.9,150.9,738.6,162z"
              />
              <path
                //"rouletteCell25"
                className="st2"
                d="M775.8,218.8l-94.1,51l-0.9,0.5c-4.7-8.6-9.7-17-15.2-25.1c-3.9-5.8-8-11.4-12.3-16.9l0,0l85.1-66.3l0,0 C752.5,179.8,765,198.8,775.8,218.8z"
              />
              <path
                //"rouletteCell26"
                className="st1"
                d="M803.3,281.2L701.8,316l-0.7,0.2l0,0c-3.1-9.1-6.7-18.1-10.6-26.7c-3-6.5-6.2-12.9-9.6-19.2l0,0l0.9-0.5 l94.1-51c4.7,8.6,9,17.3,13.1,26.2C794.2,256.8,799,268.9,803.3,281.2z"
              />
              <path
                //"rouletteCell27"
                className="st2"
                d="M820,347.4l-106,17.5l-0.6,0.1c0,0,0,0,0-0.1c-1.5-8.9-3.4-17.7-5.5-26.2c-2-7.6-4.2-15.1-6.8-22.5l0.7-0.2 l101.5-34.8C810.6,302.5,816.2,324.6,820,347.4z"
              />
              <path
                //"rouletteCell28"
                className="st1"
                d="M825.5,414.9L825.5,414.9h-108l0,0c0-8.5-0.4-17-1-25.3c-0.7-8.3-1.7-16.5-3-24.6l0.6-0.1l106-17.5 c1.8,11.1,3.2,22.3,4.2,33.7C825,392.3,825.5,403.5,825.5,414.9z"
              />
              <path
                //"rouletteCell29"
                className="st2"
                d="M825.5,414.9c0,12.1-0.5,24.1-1.6,36c-0.9,10.7-2.3,21.2-4,31.6l-106-17.6l-0.6-0.1c1.3-8.1,2.3-16.2,3-24.5 c0.7-8.4,1.1-16.9,1.1-25.5l0,0h108.1V414.9z"
              />
              <path
                //"rouletteCell30"
                className="st1"
                d="M820,482.5c-3.7,22.6-9.3,44.6-16.6,65.8l-101.8-34.7l-0.4-0.1c2.5-7.2,4.7-14.5,6.6-21.9 c2.3-8.7,4.2-17.6,5.7-26.6v-0.1l0.6,0.1L820,482.5z"
              />
              <path
                //"rouletteCell31"
                className="st2"
                d="M803.3,548.4c-4.3,12.4-9.1,24.6-14.5,36.5c-4,8.9-8.4,17.6-13,26.1l-95-51.4l0,0c3.5-6.3,6.7-12.8,9.7-19.4 c3.9-8.6,7.4-17.4,10.5-26.5c0,0,0-0.1,0.1-0.1l0.4,0.1L803.3,548.4z"
              />
              <path
                //"rouletteCell32"
                className="st1"
                d="M775.8,611c-10.9,20-23.4,39-37.3,56.9l-85.2-66.3c4.3-5.5,8.4-11.1,12.3-16.9c5.5-8.1,10.5-16.4,15.2-25.1 l0,0L775.8,611z"
              />
              <path
                //"rouletteCell33"
                className="st2"
                d="M738.5,667.8c-8.4,10.8-17.3,21.1-26.7,31c-6.2,6.5-12.7,12.9-19.4,19l-73.1-79.4c5-4.5,9.8-9.2,14.4-14.1 c6.9-7.3,13.5-14.8,19.6-22.8l0,0L738.5,667.8z"
              />
              <path
                //"rouletteCell34"
                className="st1"
                d="M692.4,717.9c-10.4,9.5-21.2,18.5-32.5,27C653,750,646,755,638.8,759.7l-59.1-90.4c5.4-3.5,10.7-7.3,15.9-11.1 c8.2-6.2,16.2-12.7,23.7-19.7l0,0L692.4,717.9z"
              />
              <path
                //"rouletteCell35"
                className="st2"
                d="M638.8,759.6C619.9,772,599.9,782.8,579,792l-43.4-98.9c5.4-2.3,10.7-4.8,15.9-7.5c9.7-5,19.1-10.4,28.2-16.4 l0,0L638.8,759.6z"
              />
              <path
                //"rouletteCell36"
                className="st1"
                d="M579,792c-13.6,6-27.7,11.2-42.1,15.7c-7.3,2.3-14.7,4.4-22.2,6.3l0,0l-26.5-104.7c5.7-1.4,11.3-3,16.9-4.7 c10.4-3.3,20.7-7.1,30.6-11.5l0,0L579,792z"
              />
              <path
                //"rouletteCell37"
                className="st2"
                d="M514.7,814c-15.2,3.8-30.8,6.8-46.7,8.9c-6.8,0.9-13.6,1.6-20.4,2.2l-8.9-107.7c5.2-0.4,10.4-1,15.5-1.6 c11.5-1.5,22.9-3.7,33.9-6.5l0,0L514.7,814z"
              />
              <line className="st4" x1="738.6" y1="161.9" x2="738.6" y2="162" />
              <line className="st4" x1="692.6" y1="111.9" x2="692.5" y2="112" />
              <line className="st4" x1="51.9" y1="610.7" x2="51.3" y2="611" />
              <line className="st4" x1="89.1" y1="667.5" x2="88.5" y2="667.9" />
              <line className="st4" x1="135.1" y1="717.5" x2="134.6" y2="718" />
              <radialGradient
                id="SVGID_1_"
                cx="413.55"
                cy="677.6208"
                r="33.0819"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" style={{ stopColor: "#4C8841" }} />
                <stop offset="0.3139" style={{ stopColor: "#337C2E" }} />
                <stop offset="1" style={{ stopColor: "#006406" }} />
              </radialGradient>
              <path
                className="st5"
                d="M438.7,112.4l-6.5,77.8c-6.2-0.5-12.4-0.7-18.7-0.7c-2.8,0-5.5,0-8.3,0.2c-3.4,0.1-6.9,0.3-10.3,0.6l0,0 l-6.5-77.8c4.9-0.4,9.9-0.7,14.9-0.9c3.6-0.1,7.2-0.2,10.8-0.2C422.4,111.4,430.6,111.7,438.7,112.4L438.7,112.4z"
              />
              <radialGradient
                id="SVGID_2_"
                cx="460.25"
                cy="674.2209"
                r="35.5997"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st6"
                d="M488.2,120.5L469,196.2c-8.4-2.1-17.1-3.8-25.8-4.9c-3.6-0.5-7.3-0.9-10.9-1.2l0,0l6.5-77.8 c5.3,0.4,10.5,1,15.6,1.6C465.8,115.5,477.1,117.7,488.2,120.5L488.2,120.5z"
              />
              <radialGradient
                id="SVGID_3_"
                cx="502.25"
                cy="664.0709"
                r="39.0399"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st7"
                d="M535.6,136.7l-31.5,71.7c-7.5-3.3-15.2-6.2-23.1-8.8c-4-1.2-8-2.4-12.1-3.4l0,0l19.2-75.8 c5.7,1.4,11.3,3,16.9,4.7C515.5,128.5,525.7,132.3,535.6,136.7z"
              />
              <radialGradient
                id="SVGID_4_"
                cx="542"
                cy="647.0209"
                r="41.4398"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st8"
                d="M579.8,160.5L537,226.1c-6.9-4.6-14.2-8.7-21.6-12.4c-3.7-1.8-7.4-3.6-11.2-5.2l31.5-71.7 c5.3,2.3,10.6,4.8,15.8,7.4C561.2,149.1,570.7,154.6,579.8,160.5z"
              />
              <radialGradient
                id="SVGID_5_"
                cx="578.2"
                cy="623.6709"
                r="42.7714"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st9"
                d="M619.4,191.4L619.4,191.4l-53,57.6c-5.8-5.4-12-10.5-18.4-15.2c-3.6-2.7-7.2-5.2-11-7.7l42.8-65.5 c5.2,3.4,10.3,7,15.3,10.7C603.6,177.5,611.7,184.3,619.4,191.4L619.4,191.4z"
              />
              <radialGradient
                id="SVGID_6_"
                cx="609.91"
                cy="594.5709"
                r="43.0218"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st10"
                d="M591.6,276.4L591.6,276.4c-4.8-6.1-9.9-12-15.3-17.6c-3.2-3.4-6.5-6.6-10-9.8l53-57.6 c4.7,4.3,9.3,8.8,13.7,13.4c7.2,7.5,14,15.3,20.3,23.5L591.6,276.4z"
              />
              <radialGradient
                id="SVGID_7_"
                cx="636.25"
                cy="560.5209"
                r="42.2241"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st11"
                d="M680.9,270.3l-68.8,37.3c-3.5-6.5-7.3-12.7-11.5-18.8c-2.8-4.2-5.8-8.3-9-12.4l61.8-48.1 c4.3,5.5,8.4,11.1,12.3,16.9C671.1,253.3,676.2,261.7,680.9,270.3z"
              />
              <radialGradient
                id="SVGID_8_"
                cx="656.6"
                cy="522.4709"
                r="40.3407"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st12"
                d="M701.1,316.3L627,341.7c-2.3-6.8-5-13.4-7.9-19.9c-2.2-4.8-4.5-9.6-7-14.2l68.8-37.3l0,0 c3.4,6.3,6.6,12.7,9.6,19.2C694.4,298.2,698,307.1,701.1,316.3C701.1,316.2,701.1,316.2,701.1,316.3z"
              />
              <radialGradient
                id="SVGID_9_"
                cx="670.3"
                cy="481.4709"
                r="37.4657"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st13"
                d="M713.5,365l-77.2,12.8c-1.1-6.6-2.5-13.1-4.2-19.5c-1.5-5.7-3.1-11.2-5-16.7l74.1-25.4 c2.5,7.4,4.8,14.9,6.8,22.5C710.1,347.3,712,356,713.5,365C713.4,364.9,713.5,365,713.5,365z"
              />
              <radialGradient
                id="SVGID_10_"
                cx="676.85"
                cy="438.5209"
                r="33.7263"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st14"
                d="M717.5,414.9L717.5,414.9h-78.3v-0.1c0-6.3-0.3-12.5-0.8-18.6c-0.5-6.2-1.2-12.4-2.2-18.4l77.2-12.8 c1.4,8.1,2.4,16.3,3,24.6C717.1,397.9,717.5,406.4,717.5,414.9z"
              />
              <radialGradient
                id="SVGID_11_"
                cx="676.85"
                cy="388.5709"
                r="33.7448"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st15"
                d="M717.5,414.9L717.5,414.9c0,8.6-0.4,17.1-1.1,25.5c-0.7,8.3-1.7,16.4-3,24.5l-77.2-12.8c1-5.9,1.7-12,2.2-18 c0.5-6.3,0.8-12.7,0.8-19.1h78.3V414.9z"
              />
              <radialGradient
                id="SVGID_12_"
                cx="670.3"
                cy="345.6886"
                r="37.4073"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st16"
                d="M713.4,464.9v0.1c-1.5,9-3.4,17.9-5.7,26.6c-1.9,7.4-4.2,14.7-6.6,21.9l-73.9-25.2l0,0 c1.8-5.2,3.4-10.4,4.7-15.8c1.8-6.7,3.2-13.4,4.4-20.3L713.4,464.9z"
              />
              <radialGradient
                id="SVGID_13_"
                cx="656.6"
                cy="304.5687"
                r="40.302"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st17"
                d="M701.1,513.5C701.1,513.5,701.1,513.6,701.1,513.5c-3.2,9.1-6.7,18-10.6,26.6c-3,6.6-6.2,13.1-9.7,19.4 l-68.7-37.2c2.5-4.5,4.8-9.2,6.9-14c3-6.5,5.7-13.3,8.1-20.2L701.1,513.5z"
              />
              <radialGradient
                id="SVGID_14_"
                cx="636.25"
                cy="266.4709"
                r="42.1477"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st18"
                d="M680.8,559.6c-4.7,8.6-9.7,17-15.2,25.1c-3.9,5.8-8,11.5-12.3,16.9l-61.6-48l0,0c3-3.9,6-7.9,8.8-12 c4.2-6.2,8.1-12.6,11.7-19.2L680.8,559.6z"
              />
              <radialGradient
                id="SVGID_15_"
                cx="609.85"
                cy="232.5209"
                r="42.9529"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st19"
                d="M653.3,601.5L653.3,601.5c-6.2,7.9-12.7,15.5-19.6,22.8c-4.6,4.9-9.4,9.6-14.4,14.1l-52.9-57.5 c3.5-3.2,6.9-6.6,10.2-10c5.3-5.5,10.3-11.3,15.1-17.4L653.3,601.5z"
              />
              <radialGradient
                id="SVGID_16_"
                cx="578.15"
                cy="203.4209"
                r="42.6764"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st20"
                d="M619.3,638.4L619.3,638.4c-7.6,7-15.5,13.5-23.7,19.7c-5.2,3.9-10.4,7.6-15.9,11.1L537,603.8 c3.9-2.5,7.7-5.2,11.4-8c6.3-4.7,12.3-9.6,18-14.9L619.3,638.4z"
              />
              <radialGradient
                id="SVGID_17_"
                cx="541.95"
                cy="180.0208"
                r="41.3442"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st21"
                d="M579.7,669.2L579.7,669.2c-9.1,5.9-18.5,11.4-28.2,16.4c-5.2,2.7-10.5,5.2-15.9,7.5l-31.4-71.6l0,0 c3.9-1.7,7.7-3.5,11.4-5.4c7.3-3.7,14.5-7.8,21.4-12.3L579.7,669.2z"
              />
              <radialGradient
                id="SVGID_18_"
                cx="502.3"
                cy="163.0208"
                r="38.9751"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st22"
                d="M535.6,693.1L535.6,693.1c-10,4.4-20.2,8.2-30.6,11.5c-5.5,1.7-11.2,3.3-16.9,4.7l0,0L469,633.6 c4.1-1,8.2-2.2,12.2-3.4c7.9-2.4,15.6-5.3,23.1-8.6L535.6,693.1z"
              />
              <radialGradient
                id="SVGID_19_"
                cx="460.2"
                cy="153.0209"
                r="35.6245"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st23"
                d="M488.1,709.3L488.1,709.3L488.1,709.3c-11.1,2.8-22.4,5-33.9,6.5c-5.1,0.7-10.3,1.2-15.5,1.6l0,0l-6.4-77.8 l0,0c3.8-0.3,7.5-0.7,11.2-1.2c8.7-1.1,17.2-2.8,25.5-4.9L488.1,709.3z"
              />
              <radialGradient
                id="SVGID_20_"
                cx="413.6"
                cy="149.3709"
                r="33.0331"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" style={{ stopColor: "#4C8841" }} />
                <stop offset="0.3139" style={{ stopColor: "#337C2E" }} />
                <stop offset="1" style={{ stopColor: "#006406" }} />
              </radialGradient>
              <path
                className="st24"
                d="M438.7,717.4L438.7,717.4L438.7,717.4c-8.1,0.7-16.4,1-24.8,1.1c-3.8,0-7.7-0.1-11.5-0.2 c-4.6-0.2-9.3-0.5-13.9-0.9l0,0l6.5-77.7l0,0c3.2,0.3,6.4,0.4,9.6,0.6c2.9,0.1,5.8,0.2,8.8,0.2c6.5,0,12.8-0.3,18.9-0.8 L438.7,717.4z"
              />
              <radialGradient
                id="SVGID_21_"
                cx="367.04"
                cy="152.8709"
                r="35.6186"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st25"
                d="M395,639.7l-6.4,77.8l0,0l0,0c-12.8-1.1-25.4-2.9-37.7-5.5c-3.9-0.9-7.8-1.8-11.7-2.8l0,0l19.1-75.5l0,0 c2.7,0.7,5.4,1.3,8.1,1.9C375.7,637.5,385.3,638.9,395,639.7z"
              />
              <radialGradient
                id="SVGID_22_"
                cx="324.95"
                cy="163.1708"
                r="38.8845"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st26"
                d="M358.2,633.6l-19.1,75.5l0,0l0,0c-12.8-3.2-25.1-7.3-37.2-12c-3.4-1.4-6.8-2.8-10.2-4.3l31.3-71.3l0,0 c2.3,1,4.7,2,7.1,3C339.1,628.1,348.5,631.2,358.2,633.6z"
              />
              <radialGradient
                id="SVGID_23_"
                cx="285.35"
                cy="180.1709"
                r="41.2175"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st27"
                d="M323,621.5L323,621.5l-31.3,71.3l0,0c-12.5-5.5-24.5-11.8-36.1-18.9c-2.6-1.7-5.3-3.3-7.9-5.1l0,0l42.5-65 l0,0c1.8,1.2,3.7,2.4,5.5,3.5C304.5,612.7,313.6,617.4,323,621.5z"
              />
              <radialGradient
                id="SVGID_24_"
                cx="249.2"
                cy="203.6709"
                r="42.4632"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st28"
                d="M290.2,603.8L290.2,603.8l-42.5,65l0,0c-11.8-7.8-23.1-16.4-33.7-25.7c-1.9-1.7-3.9-3.4-5.8-5.2l0,0 l52.5-57.1c1.4,1.3,2.8,2.5,4.1,3.7C272.9,591.6,281.3,598,290.2,603.8z"
              />
              <radialGradient
                id="SVGID_25_"
                cx="217.65"
                cy="232.6709"
                r="42.726"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st29"
                d="M260.8,580.9L208.3,638l0,0c-10.7-9.9-20.8-20.6-30-32c-1.3-1.6-2.6-3.2-3.8-4.8l0,0l61.2-47.6 c0.9,1.2,1.9,2.4,2.8,3.5C245.3,565.5,252.8,573.5,260.8,580.9z"
              />
              <radialGradient
                id="SVGID_26_"
                cx="191.3"
                cy="266.7709"
                r="41.876"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st30"
                d="M235.6,553.5l-61.2,47.6l0,0c-9.3-12-17.7-24.6-25.2-37.8c-0.8-1.4-1.5-2.7-2.2-4.1l0,0l68.1-36.9 c0.6,1,1.1,2.1,1.7,3.1C222.4,535.3,228.7,544.7,235.6,553.5z"
              />
              <radialGradient
                id="SVGID_27_"
                cx="171"
                cy="304.7209"
                r="40.0516"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st31"
                d="M215.1,522.4L147,559.2l0,0c-7.5-13.9-13.9-28.2-19.2-43.2c-0.3-0.9-0.6-1.8-0.9-2.6l0,0l0,0l73.2-25.1l0,0 c0.3,0.8,0.5,1.5,0.8,2.2C204.8,501.5,209.6,512.2,215.1,522.4z"
              />
              <radialGradient
                id="SVGID_28_"
                cx="157.35"
                cy="345.7436"
                r="37.1892"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st32"
                d="M200.1,488.2L200.1,488.2L200.1,488.2l-73.2,25.1l0,0c-5.2-15-9.2-30.3-11.9-46.2c-0.1-0.8-0.3-1.6-0.4-2.3 l0,0l0,0L191,452c0.1,0.7,0.3,1.4,0.4,2.1C193.4,465.9,196.4,477.2,200.1,488.2z"
              />
              <radialGradient
                id="SVGID_29_"
                cx="150.75"
                cy="388.5786"
                r="33.4641"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st33"
                d="M191,452.1l-76.4,12.8l0,0c-2.7-16.2-4.1-32.9-4.1-49.9l0,0H188v0.5C188,428,189,440.2,191,452.1z"
              />
              <radialGradient
                id="SVGID_30_"
                cx="150.7"
                cy="438.4709"
                r="33.5486"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st34"
                d="M191,377.8c-2,12.1-3.1,24.5-3.1,37.1l0,0h-77.5v-0.1c0-16.9,1.4-33.6,4.1-49.7l0,0l0,0L191,377.8L191,377.8z"
              />
              <radialGradient
                id="SVGID_31_"
                cx="157.4"
                cy="481.2709"
                r="37.2447"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st35"
                d="M200.2,341.7c-3.9,11.5-7,23.3-9,35.5c0,0.2-0.1,0.4-0.1,0.7l0,0l0,0l-76.5-12.8l0,0c0.1-0.7,0.2-1.3,0.3-2 c2.8-16,6.8-31.5,11.9-46.6l0,0L200.2,341.7z"
              />
              <radialGradient
                id="SVGID_32_"
                cx="171.05"
                cy="522.2709"
                r="40.0592"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st36"
                d="M215.2,307.6c-5.6,10.4-10.5,21.2-14.4,32.5c-0.2,0.5-0.4,1.1-0.6,1.6l-73.3-25.2l0,0 c0.4-1.1,0.8-2.3,1.2-3.4c5.3-14.7,11.6-28.9,19-42.4l0,0L215.2,307.6z"
              />
              <radialGradient
                id="SVGID_33_"
                cx="191.35"
                cy="560.3209"
                r="41.9265"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st37"
                d="M235.7,276.5c-7,8.9-13.3,18.4-18.9,28.3c-0.5,0.9-1,1.9-1.6,2.8l0,0l-68.2-37c0.9-1.7,1.8-3.3,2.7-5 c7.4-12.9,15.6-25.2,24.7-36.9l0,0L235.7,276.5z"
              />
              <radialGradient
                id="SVGID_34_"
                cx="217.6"
                cy="594.2709"
                r="42.8029"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st38"
                d="M260.9,249.1L260.9,249.1c-8.2,7.5-15.8,15.7-22.9,24.4c-0.8,1-1.6,2-2.4,3l-61.3-47.7 c1.4-1.7,2.7-3.5,4.1-5.2c9.2-11.2,19.1-21.9,29.8-31.7l0,0L260.9,249.1z"
              />
              <radialGradient
                id="SVGID_35_"
                cx="249.35"
                cy="623.3209"
                r="42.4765"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st39"
                d="M290.3,226.2c-8.9,5.8-17.3,12.3-25.3,19.3c-1.4,1.2-2.7,2.4-4,3.6l0,0L208.4,192c2.1-2,4.3-3.9,6.5-5.8 c10.4-9.1,21.4-17.4,32.9-25l0,0L290.3,226.2z"
              />
              <radialGradient
                id="SVGID_36_"
                cx="285.35"
                cy="646.9208"
                r="41.1984"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st40"
                d="M323,208.4c-9.7,4.2-18.9,9.1-27.9,14.6c-1.6,1-3.3,2-4.9,3.1L247.7,161c2.6-1.7,5.2-3.4,7.8-5 c11.5-7.2,23.6-13.5,36.1-19l0,0L323,208.4z"
              />
              <radialGradient
                id="SVGID_37_"
                cx="324.95"
                cy="663.8708"
                r="38.8845"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="4.020000e-02" style={{ stopColor: "#333333" }} />
                <stop offset="0.4686" style={{ stopColor: "#1A1A1A" }} />
                <stop offset="1" style={{ stopColor: "#000000" }} />
              </radialGradient>
              <path
                className="st41"
                d="M358.2,196.3c-9.8,2.5-19.4,5.6-28.8,9.4c-2.2,0.9-4.3,1.8-6.4,2.7l-31.3-71.3c3.2-1.4,6.5-2.8,9.8-4.1 c12.2-4.8,24.7-8.9,37.6-12.2l0,0L358.2,196.3z"
              />
              <radialGradient
                id="SVGID_38_"
                cx="367.04"
                cy="674.0709"
                r="35.6186"
                gradientTransform="matrix(1 0 0 -1 0 828.4709)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" className="whell-ic-cell-red s5" />
                <stop offset="0.2342" className="whell-ic-cell-red s4" />
                <stop offset="0.5295" className="whell-ic-cell-red s3" />
                <stop offset="0.7941" className="whell-ic-cell-red s2" />
                <stop offset="1" className="whell-ic-cell-red s1" />
              </radialGradient>
              <path
                className="st42"
                d="M395,190.2c-9.7,0.8-19.3,2.2-28.6,4.2c-2.7,0.6-5.4,1.2-8.1,1.9l-19.1-75.5c4-1,8-1.9,12-2.8 c12.3-2.6,24.7-4.5,37.4-5.5l0,0L395,190.2z"
              />
              <radialGradient
                id="SVGID_39_"
                cx="416.2999"
                cy="1089.49"
                r="225.2881"
                gradientTransform="matrix(1 0 0 -1 0 1504.4399)"
                gradientUnits="userSpaceOnUse"
              >
                <stop className="circle-inner-gradient g1" offset="0.8945" />
                <stop className="circle-inner-gradient g2" offset="0.901" />
                <stop className="circle-inner-gradient g3" offset="0.9166" />
                <stop className="circle-inner-gradient g4" offset="0.9387" />
                <stop className="circle-inner-gradient g5" offset="1" />
              </radialGradient>
              <path
                className="st43"
                d="M639.8,385.1c-1.7-13-4.5-25.5-8.3-37.7c-3.7-12-8.4-23.5-14-34.5c-5.8-11.5-12.6-22.5-20.3-32.8 c-7.5-10.1-15.8-19.5-24.9-28.2c-9.1-8.7-18.9-16.7-29.4-23.8s-21.5-13.4-33.1-18.6c-11.5-5.3-23.5-9.6-36-12.8 c-12.4-3.3-25.2-5.5-38.4-6.6c-6.3-0.5-12.8-0.8-19.2-0.8c-6.3,0-12.5,0.3-18.6,0.8c-13,1-25.6,3.2-37.9,6.4 c-12.7,3.3-24.9,7.6-36.6,12.9c-11.5,5.2-22.6,11.4-33,18.5c-10.7,7.2-20.7,15.4-30,24.3c-9.1,8.7-17.5,18.2-25,28.4 c-7.6,10.2-14.4,21.1-20.1,32.6c-5.5,11-10.2,22.4-14,34.3c-3.8,12.2-6.6,24.9-8.3,37.9c-1.3,9.7-1.9,19.6-1.9,29.6 c0,2.8,0,5.5,0.2,8.3c0.5,13.3,2.1,26.3,4.8,38.9c2.7,12.7,6.5,25,11.3,36.9c4.8,12,10.6,23.4,17.3,34.3 c6.6,10.7,14.1,20.8,22.4,30.2c8.5,9.7,17.9,18.7,28,26.9c9.8,7.9,20.3,15,31.3,21.3c11.2,6.3,23,11.7,35.3,16 c12,4.2,24.4,7.5,37.1,9.6c12.3,2.1,24.9,3.2,37.8,3.2h0.5c13.3,0,26.2-1.2,38.8-3.4c12.4-2.2,24.5-5.4,36.2-9.5 c12.2-4.3,23.9-9.7,35-16c11.2-6.3,21.7-13.5,31.6-21.5c9.9-8.1,19.2-17,27.6-26.6c8.4-9.6,16-19.9,22.7-30.8 c6.7-10.9,12.4-22.4,17.2-34.3c4.6-11.6,8.3-23.8,11-36.3c2.6-12.4,4.2-25.2,4.7-38.2c0.1-2.9,0.2-5.8,0.2-8.8 C641.7,404.6,641.1,394.7,639.8,385.1z M513.1,417.1c-1.3,52.5-44.2,94.5-97,94.5s-95.6-42-97-94.5c0-0.7,0-1.4,0-2.2 c0-0.8,0-1.7,0-2.5c1.1-52.6,44.1-94.8,97-94.8s95.8,42.2,97,94.8c0,0.8,0,1.7,0,2.5C513.2,415.6,513.2,416.3,513.1,417.1z"
              />
              <radialGradient
                id="SVGID_40_"
                cx="415.0172"
                cy="1089.4399"
                r="411.5"
                gradientTransform="matrix(1 0 0 -1 0 1504.4399)"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0.9397"
                  style={{ stopColor: "#130831", stopOpacity: 0 }}
                />
                <stop
                  offset="0.9668"
                  style={{ stopColor: "#0A0419", stopOpacity: 0.3146 }}
                />
                <stop
                  offset="1"
                  style={{ stopColor: "#000000", stopOpacity: 0.7 }}
                />
              </radialGradient>
              <path
                className="st44"
                d="M823,361c-3.1-23.7-8.2-46.7-15.2-68.9c-14-44.8-35.4-86.3-62.9-123c-13.9-18.6-29.3-36-46-51.9 c-33.2-31.6-71.7-57.8-114-77C533.1,16.6,475.6,3.5,415,3.5S296.9,16.6,245.1,40.1c-42.7,19.4-81.6,45.9-115,78 c-49.4,47.4-87,107-107.9,174C15.3,314.3,10.1,337.4,7,361c-2.3,17.7-3.5,35.7-3.5,54c0,29.5,3.1,58.2,9,85.9 C22.3,547.3,40,590.8,64.1,630c48.8,79.5,123.8,141.1,213,172.8c43.1,15.3,89.5,23.7,137.9,23.7c98.1,0,188.2-34.3,258.9-91.6 c36.3-29.4,67.5-64.9,92-104.9c24-39.2,41.7-82.7,51.6-129.1c5.9-27.7,9-56.4,9-85.9C826.5,396.7,825.3,378.7,823,361z"
              />
              <path
                className="st45"
                d="M714.5,374.7c-2.3-17.5-6.1-34.5-11.2-50.8c-5.1-16.1-11.4-31.7-19-46.5c-7.9-15.5-17.1-30.3-27.5-44.1 c-10.2-13.6-21.5-26.4-33.8-38.1c-12.3-11.7-25.5-22.4-39.7-31.9c-14-9.5-28.9-17.8-44.5-24.9c-15.5-7-31.7-12.8-48.5-17.2 c-16.6-4.3-33.7-7.3-51.2-8.7c-8.4-0.7-16.9-1.1-25.5-1.1c-8.5,0-17,0.4-25.3,1c-17.4,1.4-34.5,4.4-50.9,8.6 c-17,4.4-33.5,10.3-49.2,17.4c-15.5,7.1-30.3,15.4-44.3,24.8c-14.4,9.7-27.9,20.6-40.4,32.6c-12.2,11.7-23.4,24.4-33.6,38 c-10.2,13.7-19.3,28.3-27.1,43.7c-7.5,14.8-13.8,30.3-18.9,46.3c-5.1,16.4-8.9,33.4-11.2,50.8c-1.7,13.1-2.6,26.5-2.6,40.1 c0,3.6,0.1,7.2,0.2,10.8c0.6,17.9,2.8,35.3,6.4,52.3c3.6,17.1,8.7,33.6,15,49.6c6.4,16,14.1,31.4,23.1,45.9 c8.9,14.4,18.9,28.1,30,40.8c11.4,13.1,24,25.3,37.5,36.3c13.2,10.7,27.3,20.3,42.1,28.8c15.1,8.5,30.9,15.8,47.4,21.7 c16.1,5.7,32.8,10.1,50,13.1c16.8,2.9,34.1,4.4,51.7,4.4c17.9,0,35.4-1.5,52.4-4.5c16.8-2.9,33-7.2,48.8-12.8 c16.5-5.8,32.2-13,47.3-21.4c15.1-8.5,29.3-18.2,42.7-29c13.4-10.9,25.9-22.9,37.2-35.8c11.3-12.9,21.6-26.9,30.7-41.6 c9-14.7,16.8-30.2,23.2-46.3c6.2-15.7,11.2-32,14.8-48.9c3.5-16.7,5.7-34,6.4-51.6c0.1-3.8,0.2-7.7,0.2-11.5 C717.1,401.2,716.2,387.8,714.5,374.7z"
              />
              <path
                className="st46"
                d="M395.4,41.1v-1.5c0-1.3,0.1-2.4,0.5-3.2c0.4-0.8,1-1.4,1.9-2c0.3-0.2,0.6-0.3,0.9-0.4 c0.3-0.1,0.7-0.2,1.1-0.3c0.4-0.1,0.9-0.1,1.5-0.2c0.6,0,1.3-0.1,2.2-0.1c1,0,1.9,0,2.6,0s1.3,0.1,1.7,0.2c0.5,0.1,0.9,0.3,1.3,0.4 c0.4,0.2,0.7,0.4,1,0.7c0.8,0.8,1.3,1.9,1.5,3.2c0,0.3,0.1,0.6,0.1,0.9c0,0.2,0,0.8,0,1.7l0.6,26.3c0,0.7,0,1.2,0,1.7 c0,0.4,0,0.8,0,1.1c0,0.3,0,0.6-0.1,0.8c-0.1,0.2-0.1,0.4-0.2,0.6c-0.3,0.7-0.7,1.3-1.2,1.9c-0.6,0.5-1.2,0.9-2.1,1.1 c-0.4,0.1-1,0.2-1.6,0.3c-0.6,0.1-1.5,0.1-2.8,0.2c-0.8,0-1.5,0-2.2,0c-0.6,0-1.1,0-1.5-0.1c-0.4-0.1-0.8-0.1-1.1-0.2 c-0.3-0.1-0.6-0.2-0.9-0.4c-0.9-0.5-1.5-1.1-2-1.9c-0.4-0.8-0.6-1.9-0.6-3.2v-1.4L395.4,41.1z M404.9,41.9v-0.8 c0-0.8-0.1-1.3-0.3-1.6c-0.2-0.3-0.5-0.4-0.9-0.4c-0.6,0-1,0.4-1.1,1c0,0.2-0.1,0.4-0.1,0.6c0,0.3,0,0.7,0,1.2l0.6,24.3 c0,0.7,0,1.1,0.1,1.4c0,0.2,0.1,0.4,0.1,0.6c0.2,0.6,0.6,0.9,1.1,0.9c0.8,0,1.2-0.7,1.1-2.2v-0.8L404.9,41.9z"
              />
              <path
                className="st46"
                d="M416.9,40.7v-1.5c0-1.3,0.3-2.4,0.7-3.2c0.4-0.8,1-1.4,2-1.9c0.3-0.2,0.6-0.3,0.9-0.4c0.3-0.1,0.7-0.2,1.1-0.2c0.4,0,0.9-0.1,1.5-0.1c0.6,0,1.3,0,2.2,0c1,0,1.9,0.1,2.6,0.1c0.7,0.1,1.3,0.2,1.7,0.3c0.5,0.1,0.9,0.3,1.2,0.5c0.4,0.2,0.7,0.5,1,0.8c0.8,0.8,1.2,2,1.3,3.3c0,0.3,0,0.6,0,0.9c0,0.2,0,0.8-0.1,1.7l-0.8,26.2c0,0.7,0,1.2-0.1,1.7c0,0.4-0.1,0.8-0.1,1.1c0,0.3-0.1,0.5-0.1,0.7c-0.1,0.2-0.1,0.4-0.2,0.6c-0.3,0.7-0.8,1.2-1.3,1.7c-0.6,0.5-1.3,0.8-2.1,1c-0.4,0.1-1,0.2-1.6,0.2c-0.6,0-1.5,0-2.8,0c-0.8,0-1.5-0.1-2.2-0.1c-0.6,0-1.1-0.1-1.5-0.2c-0.4-0.1-0.8-0.2-1.1-0.3c-0.3-0.1-0.6-0.3-0.9-0.5c-0.8-0.5-1.4-1.2-1.9-2c-0.4-0.7-0.5-1.9-0.5-3.2v-1.4L416.9,40.7z M426.3,42v-0.8c0-0.8,0-1.3-0.2-1.6s-0.5-0.5-0.9-0.5c-0.6,0-1,0.3-1.1,1c0,0.2-0.1,0.4-0.1,0.6c0,0.3-0.1,0.7-0.1,1.2l-0.7,24.3c0,0.7,0,1.1,0,1.4c0,0.2,0,0.4,0.1,0.6c0.2,0.6,0.5,1,1,1c0.8,0,1.2-0.7,1.3-2.2v-0.8L426.3,42z"
              />
              <path
                className="st46"
                d="M456,70.5l11.4-17.3c0.5-0.7,0.7-1.1,0.7-1.3l0.2-1.1l0.8-5.7l0.1-0.4c0.2-1.1-0.1-1.9-0.9-2 c-0.8-0.1-1.3,0.4-1.4,1.4l-0.1,0.4l-0.9,6.6l-6.9-1l1-7.3l0.2-1.1c0.2-1.3,0.6-2.4,1.1-3.1c0.6-0.7,1.4-1.2,2.5-1.5 c0.5-0.2,1.2-0.2,2-0.2c0.7,0,1.7,0.1,3.1,0.3c1,0.1,1.9,0.3,2.5,0.4c0.7,0.1,1.2,0.3,1.7,0.4c0.4,0.2,0.8,0.3,1.1,0.5 c0.3,0.2,0.6,0.4,0.9,0.7c0.7,0.7,1.1,1.4,1.3,2.3c0.2,0.8,0.1,2.1-0.1,3.6l-0.8,5.7c-0.2,1.5-0.5,2.8-0.8,3.6 c-0.3,0.9-0.8,1.9-1.5,3l-10.1,14.9l9.2,1.3l-0.8,5.4l-16.3-2.3L456,70.5z"
              />
              <path
                className="st46"
                d="M488.9,46.3l-8-1.6l1.1-5.4l14.7,3l-1.3,6.9l-15.1,31.8l-6.9-1.3L488.9,46.3z"
              />
              <path
                className="st46"
                d="M521.6,59.9l-3.8-1.1l1.6-5.3c1.6,0.3,3,0.1,4-0.4c1-0.6,2-1.6,2.7-3.3l5.3,1.6l-12,39.4l-6.7-2.1L521.6,59.9z"
              />
              <path
                className="st46"
                d="M534.1,60l0.5-1.4c0.4-1.2,1-2.2,1.6-2.8c0.6-0.6,1.4-1,2.5-1.2c0.3-0.1,0.6-0.1,1-0.1c0.3,0,0.7,0,1.1,0.1 c0.4,0.1,0.9,0.2,1.5,0.4c0.6,0.2,1.2,0.4,2.1,0.7c0.9,0.3,1.7,0.6,2.5,0.9c0.6,0.3,1.1,0.5,1.6,0.8c0.5,0.3,0.8,0.6,1,0.9 c0.3,0.3,0.5,0.7,0.7,1c0.5,1,0.6,2.3,0.3,3.6c-0.1,0.3-0.2,0.6-0.2,0.9c-0.1,0.2-0.3,0.8-0.6,1.6l-8.9,24.7 c-0.2,0.6-0.4,1.2-0.6,1.6c-0.2,0.4-0.3,0.7-0.4,1s-0.2,0.5-0.4,0.7c-0.1,0.2-0.3,0.3-0.4,0.5c-0.5,0.5-1.1,1-1.9,1.2 c-0.7,0.3-1.5,0.4-2.3,0.3c-0.5,0-1-0.1-1.6-0.3c-0.6-0.2-1.5-0.4-2.7-0.8c-0.8-0.3-1.4-0.5-2-0.7c-0.5-0.2-1-0.4-1.4-0.6 s-0.7-0.4-1-0.6c-0.3-0.2-0.5-0.4-0.7-0.7c-0.6-0.7-1-1.5-1.1-2.5c-0.1-0.9,0.1-2,0.5-3.2l0.5-1.4L534.1,60z M542.7,64.1l0.3-0.8 c0.3-0.7,0.4-1.2,0.3-1.6c-0.1-0.3-0.3-0.6-0.7-0.7c-0.6-0.2-1,0-1.4,0.6c-0.1,0.1-0.2,0.3-0.3,0.6c-0.1,0.2-0.3,0.6-0.4,1.1 l-8.2,22.8c-0.2,0.6-0.4,1.1-0.4,1.3c-0.1,0.2-0.1,0.4-0.1,0.6c0,0.7,0.2,1.1,0.7,1.3c0.8,0.3,1.4-0.3,1.9-1.6l0.3-0.8L542.7,64.1z"
              />
              <path
                className="st46"
                d="M561.4,100.2l16.2-12.9c0.6-0.5,1-0.8,1.1-1l0.5-1l2.5-5l0.2-0.4c0.5-1,0.4-1.7-0.3-2.2 c-0.7-0.4-1.3,0-1.9,0.9l-0.2,0.4l-2.9,6l-6.3-3.1l3.3-6.7l0.5-1c0.6-1.1,1.2-2.1,2.1-2.6c0.8-0.5,1.7-0.7,2.9-0.7 c0.6,0,1.2,0.1,1.9,0.4c0.6,0.2,1.6,0.6,2.8,1.2c0.9,0.4,1.6,0.8,2.3,1.1c0.6,0.3,1.1,0.6,1.5,0.9c0.4,0.3,0.7,0.6,0.9,0.8 c0.2,0.3,0.4,0.6,0.6,0.9c0.4,0.8,0.6,1.7,0.5,2.6c-0.1,0.8-0.5,2-1.2,3.4l-2.5,5c-0.7,1.4-1.3,2.5-2,3.2c-0.6,0.7-1.4,1.5-2.4,2.4 L567.4,104l8.3,4.1l-2.5,4.9l-14.7-7.3L561.4,100.2z"
              />
              <path
                className="st46"
                d="M590.1,103.1l-4.5,8c-0.4,0.7-0.6,1.3-0.7,1.7c0,0.4,0.2,0.7,0.5,0.9c0.4,0.2,0.7,0.2,1,0 c0.3-0.2,0.7-0.6,1.1-1.3l0.1-0.2l7.2-12.7c0.4-0.6,0.5-1.1,0.5-1.4c0-0.3-0.2-0.6-0.6-0.8c-0.7-0.4-1.3-0.2-1.7,0.6l-0.3,0.5 l-0.7,1.2l-6.1-3.4l9.9-17.4L610,87l-2.8,4.8l-8.2-4.6l-3.6,6.4c1.5-0.5,3.1-0.3,4.4,0.4c1.5,0.8,2.4,2.1,2.6,3.6 c0.2,1.5-0.2,3.3-1.3,5.2l-0.3,0.6l-7.6,13.4l-0.5,0.9c-1.2,2.2-2.6,3.2-4.2,3.3c-0.8,0.1-1.5,0-2.4-0.3c-0.7-0.3-1.9-0.8-3.4-1.6 c-0.7-0.4-1.3-0.7-1.9-1c-0.5-0.3-0.9-0.6-1.2-0.8c-0.3-0.3-0.6-0.5-0.9-0.8c-0.2-0.3-0.5-0.5-0.6-0.8c-1-1.6-1-3.5,0.2-5.6 l0.5-0.9l5.1-9L590.1,103.1z"
              />
              <path
                className="st46"
                d="M612.1,129.3l18.2-10c0.7-0.4,1.1-0.6,1.2-0.8l0.7-0.9l3.3-4.6l0.2-0.3c0.7-0.9,0.7-1.6,0.1-2.2 c-0.6-0.5-1.3-0.3-2,0.6l-0.2,0.3l-3.9,5.3l-5.7-4.1l4.3-6l0.6-0.9c0.8-1,1.5-1.7,2.5-2.2c0.8-0.4,1.9-0.4,3-0.2 c0.6,0.1,1.1,0.3,1.7,0.7c0.6,0.4,1.4,0.9,2.6,1.7c0.8,0.6,1.4,1.1,2.1,1.5c0.5,0.4,1,0.8,1.3,1.2s0.6,0.7,0.7,1 c0.2,0.3,0.3,0.6,0.4,1c0.3,0.9,0.3,1.9,0.1,2.7c-0.2,0.8-0.8,1.9-1.7,3.2l-3.3,4.6c-0.9,1.2-1.7,2.2-2.5,2.9 c-0.7,0.6-1.6,1.2-2.8,2l-15.8,8.5l7.5,5.4l-3.3,4.5l-13.3-9.7L612.1,129.3z"
              />
              <path
                className="st46"
                d="M638.4,139.2l-3.8,4.6l-0.2,0.3c-0.6,0.7-1,1.3-1,1.7c-0.1,0.4,0,0.7,0.4,1c0.3,0.3,0.7,0.3,1,0.2 c0.4-0.1,0.8-0.6,1.4-1.2l0.3-0.4l6-7.4c-1,0-1.9,0-2.4-0.2c-0.5-0.2-1.1-0.5-1.6-0.9c-1.3-1.1-2.1-2.6-2.1-4.2 c0-0.7,0.2-1.4,0.5-2.2c0.3-0.7,0.8-1.4,1.5-2.4l0.4-0.5l6.9-8.4c0.9-1.1,1.7-2,2.4-2.4c0.6-0.4,1.3-0.6,2.2-0.7c0.5,0,0.9,0,1.3,0 s0.8,0.2,1.3,0.4c0.4,0.2,0.9,0.5,1.5,0.9c0.6,0.4,1.2,0.9,2.1,1.6c1.3,1,2.3,1.9,2.8,2.5c0.5,0.6,0.9,1.2,1.1,1.9 c0.3,1,0.3,2,0.1,2.8c-0.2,0.8-0.8,1.9-1.7,3l-0.5,0.6l-17.2,21l-0.3,0.4c-0.8,1-1.5,1.7-2.3,2.2c-0.6,0.4-1.3,0.6-2.1,0.7 c-0.9,0-1.7-0.1-2.6-0.5c-0.8-0.3-1.9-1-3.1-2.1c-0.9-0.7-1.6-1.3-2.2-1.9c-0.6-0.5-1-1-1.3-1.4c-0.3-0.4-0.6-0.8-0.7-1.2 c-0.2-0.4-0.3-0.7-0.3-1.1c-0.1-0.8,0-1.6,0.2-2.3c0.2-0.7,0.7-1.5,1.4-2.4l0.3-0.4l4.9-6.1L638.4,139.2z M644.6,131.7l-0.1,0.1 c-0.9,1.1-1,2-0.4,2.5c0.3,0.3,0.7,0.4,1,0.2c0.3-0.1,0.8-0.5,1.3-1.2l6-7.3c0.5-0.7,0.8-1.2,0.9-1.5c0.1-0.4-0.1-0.7-0.4-1 c-0.6-0.5-1.4-0.2-2.4,0.9l-0.1,0.1L644.6,131.7z"
              />
              <path
                className="st46"
                d="M675.9,151.8l-2.8-2.8l3.9-3.9c1.3,1,2.6,1.5,3.8,1.5c1.1,0,2.5-0.6,3.9-1.6l3.9,3.9l-29.2,29l-4.9-4.9 L675.9,151.8z"
              />
              <path
                className="st46"
                d="M666.6,175.9l19.8-6.1c0.8-0.2,1.2-0.4,1.4-0.5l0.8-0.8l4.2-3.8l0.3-0.3c0.9-0.8,1-1.5,0.5-2.2 s-1.2-0.5-2.1,0.2l-0.3,0.3l-4.9,4.4l-4.7-5.1l5.4-4.9l0.8-0.7c0.9-0.9,2-1.4,2.9-1.6s2-0.1,2.9,0.4c0.5,0.2,1,0.6,1.6,1 c0.5,0.4,1.2,1.2,2.2,2.2c0.6,0.7,1.2,1.3,1.6,1.9c0.4,0.5,0.8,1,1,1.4c0.2,0.4,0.4,0.8,0.5,1.1s0.2,0.7,0.2,1.1 c0.1,0.9-0.1,1.9-0.5,2.6c-0.4,0.7-1.2,1.6-2.4,2.7l-4.2,3.8c-1.1,1-2.2,1.9-3,2.3c-0.8,0.5-1.9,0.9-3.1,1.3l-17.3,5.1l6.2,6.9 l-4.1,3.7l-11-12.1L666.6,175.9z"
              />
              <path
                className="st46"
                d="M713.9,210.4c-0.1-0.6-0.1-1.2-0.1-1.7s0.2-0.9,0.4-1.3c0.2-0.4,0.5-0.8,0.9-1.2c0.4-0.4,0.9-0.8,1.5-1.2 l0.4-0.3l4.8-3.3l1-0.7c1.2-0.8,2.3-1.2,3.2-1.3c0.9-0.1,2,0.1,2.9,0.6c0.5,0.3,1,0.7,1.5,1.3s1.2,1.5,2.2,3c1,1.4,1.6,2.6,2,3.4 s0.5,1.5,0.4,2.3c-0.1,0.9-0.3,1.7-0.8,2.5c-0.5,0.7-1.3,1.4-2.6,2.3l-0.4,0.3l-5.1,3.5l-0.4,0.3c-1.1,0.7-2.2,1.1-3.1,1.2 c-0.9,0.1-2-0.2-3-0.7c0.2,1.3,0,2.4-0.4,3.2c-0.4,0.8-1.2,1.6-2.5,2.5l-0.7,0.5l-7.1,4.8l-0.7,0.5c-1.1,0.7-2.1,1.1-2.9,1.3 c-0.8,0.1-1.7,0-2.6-0.3c-0.3-0.1-0.6-0.3-0.9-0.5c-0.3-0.2-0.6-0.5-0.9-0.8c-0.3-0.3-0.7-0.8-1.1-1.3c-0.4-0.5-0.8-1.1-1.4-2 c-1.1-1.6-1.7-2.9-2.1-3.7c-0.3-0.9-0.3-1.9-0.1-2.8c0.1-0.8,0.5-1.4,0.9-2c0.5-0.5,1.3-1.2,2.7-2.2l6.7-4.5l1-0.7 c0.7-0.4,1.2-0.8,1.9-1c0.5-0.2,1-0.4,1.5-0.5c0.5-0.1,0.9,0,1.4,0.1C712.7,209.9,713.2,210.1,713.9,210.4z M713,218.8l0.3-0.2 c1.2-0.8,1.5-1.5,1.1-2.3c-0.4-0.7-1.2-0.6-2.5,0.2l-0.3,0.2l-7.4,4.9l-0.3,0.2c-1.1,0.8-1.4,1.5-1,2.2c0.4,0.7,1.3,0.6,2.5-0.2 l0.1-0.1L713,218.8z M727,209.3l0.3-0.2c0.9-0.6,1.2-1.3,0.7-2c-0.4-0.7-1.2-0.7-2.2,0l-0.2,0.2l-5.6,3.7l-0.2,0.2 c-0.9,0.7-1.2,1.4-0.8,2.1c0.5,0.7,1.2,0.7,2.2,0l0.2-0.2L727,209.3z"
              />
              <path
                className="st46"
                d="M748.6,253.6L747,250l5-2.4c0.9,1.4,2,2.4,3,2.7c1.1,0.4,2.6,0.3,4.3-0.2l2.4,5l-37.3,17.4l-3-6.3 L748.6,253.6z"
              />
              <path
                className="st46"
                d="M741.7,276.8l-5.6,2.3l-0.3,0.1c-0.9,0.4-1.5,0.7-1.7,1c-0.3,0.3-0.3,0.7-0.1,1.1c0.2,0.4,0.4,0.6,0.8,0.7 c0.4,0,1-0.1,1.9-0.4l0.4-0.2l8.8-3.6c-0.9-0.4-1.6-0.9-2-1.3c-0.4-0.4-0.7-0.9-1-1.6c-0.7-1.6-0.6-3.2,0.2-4.7 c0.4-0.6,0.8-1.2,1.4-1.6c0.6-0.5,1.4-0.9,2.5-1.3l0.6-0.3l10.1-4.1c1.4-0.6,2.5-0.9,3.2-0.9s1.4,0.1,2.3,0.4 c0.4,0.2,0.8,0.4,1.1,0.6c0.3,0.2,0.6,0.6,0.9,1c0.3,0.4,0.6,0.9,0.9,1.5c0.3,0.6,0.6,1.4,1,2.5c0.6,1.5,1,2.8,1.2,3.5 c0.2,0.8,0.2,1.5,0.1,2.2c-0.2,1-0.6,1.9-1.2,2.5c-0.6,0.6-1.5,1.2-2.9,1.7l-0.7,0.3l-25.1,10.3l-0.5,0.2c-1.2,0.5-2.3,0.8-3,0.8 c-0.8,0.1-1.5-0.1-2.2-0.4c-0.8-0.4-1.5-0.9-2.1-1.6s-1.1-1.9-1.7-3.3c-0.4-1-0.8-2-1-2.7c-0.3-0.7-0.4-1.3-0.5-2 c-0.1-0.5-0.1-1-0.1-1.4s0.1-0.8,0.3-1.1c0.3-0.8,0.7-1.4,1.2-2s1.3-0.9,2.5-1.4l0.4-0.2l7.3-3L741.7,276.8z M750.8,273.1l-0.2,0.1 c-1.3,0.5-1.9,1.2-1.5,2c0.2,0.4,0.4,0.6,0.8,0.7c0.4,0,0.9-0.1,1.7-0.4l8.6-3.6c0.8-0.3,1.3-0.6,1.5-0.9c0.2-0.3,0.3-0.6,0.1-1 c-0.3-0.7-1.1-0.8-2.5-0.3l-0.2,0.1L750.8,273.1z"
              />
              <path
                className="st46"
                d="M759,318.1l-8.9,2.6l-0.3,0.1c-1.3,0.4-1.9,0.9-1.6,1.7c0.2,0.8,1,1,2.4,0.6l0.2-0.1l8.9-2.6l0.4-0.1 c1.2-0.3,1.6-1,1.2-2.2l-0.1-0.3l-0.5-1.7l5.3-1.5l0.4,1.4c0.3,1,0.6,1.7,0.9,1.9c0.3,0.2,0.9,0.1,2-0.1l0.5-0.1l5.2-1.4l0.6-0.2 c1.2-0.3,1.6-0.9,1.4-1.6c-0.2-0.8-1-1-2.3-0.6l-0.5,0.1l-6,1.6l-1.9-6.7l6.3-1.7l1-0.3c1.4-0.4,2.6-0.6,3.4-0.6 c0.8,0.1,1.6,0.4,2.4,0.9c0.8,0.6,1.4,1.5,2,2.9c0.1,0.2,0.2,0.6,0.3,1c0.1,0.5,0.3,1,0.5,1.7c0.3,0.9,0.5,1.7,0.6,2.5 c0.1,0.7,0.2,1.2,0.3,1.7c0,0.5,0,0.9-0.1,1.3c-0.1,0.4-0.2,0.8-0.4,1.1c-0.4,0.7-0.9,1.3-1.5,1.7s-1.6,0.8-3.1,1.2l-0.8,0.2 l-5.3,1.5l-0.6,0.2c-1.4,0.4-2.6,0.5-3.5,0.3c-0.8-0.2-1.7-0.8-2.6-1.7c-0.3,1.3-0.7,2.3-1.3,2.9s-1.7,1.1-3.4,1.6l-8.4,2.4 l-0.9,0.3c-1.6,0.4-2.9,0.6-3.8,0.4c-0.9-0.1-1.7-0.5-2.6-1.3c-0.2-0.2-0.4-0.5-0.6-0.7c-0.2-0.3-0.4-0.6-0.6-1 c-0.2-0.4-0.3-0.9-0.5-1.4c-0.2-0.5-0.4-1.3-0.6-2.2c-0.5-1.7-0.7-3-0.8-3.9c-0.1-0.9,0-1.6,0.3-2.4c0.4-0.8,0.8-1.4,1.5-2 c0.6-0.5,1.5-0.9,2.8-1.2l0.6-0.2l10.1-2.8L759,318.1z"
              />
              <path
                className="st46"
                d="M775.4,329.9l-0.9-3.8l5.4-1.2c0.6,1.6,1.3,2.7,2.4,3.3s2.5,0.8,4.2,0.7l1.2,5.4l-40.1,9.3l-1.5-6.8 L775.4,329.9z"
              />
              <path
                className="st46"
                d="M783.3,372.9l-0.4-3.9l5.6-0.6c0.4,1.6,1,2.9,2,3.5c0.9,0.7,2.3,1.1,4.1,1.2l0.6,5.6l-40.9,4.3l-0.7-6.9 L783.3,372.9z"
              />
              <path
                className="st46"
                d="M776.7,388.1c0.2-0.6,0.5-1.1,0.8-1.5c0.3-0.4,0.6-0.7,1-1c0.4-0.2,0.8-0.4,1.4-0.6c0.5-0.1,1.2-0.2,2-0.3 h0.5l5.8-0.3l1.3-0.1c1.4-0.1,2.6,0.1,3.5,0.5c0.8,0.4,1.5,1.1,2.2,2.1c0.3,0.5,0.5,1.1,0.7,2c0.1,0.7,0.2,2,0.3,3.7s0.1,3.1,0,3.9 s-0.4,1.5-0.8,2.2c-0.5,0.8-1.2,1.3-2,1.6c-0.8,0.3-1.9,0.5-3.3,0.6h-0.5l-6.2,0.4H783c-1.3,0.1-2.5-0.1-3.3-0.5 c-0.8-0.4-1.5-1.1-2.2-2.2c-0.5,1.2-1.2,2.1-2,2.6c-0.7,0.4-1.9,0.7-3.4,0.8l-0.9,0.1l-8.5,0.5l-0.9,0.1c-1.3,0.1-2.4,0-3.2-0.3 c-0.8-0.3-1.5-0.8-2.1-1.6c-0.2-0.3-0.4-0.6-0.5-0.9c-0.1-0.3-0.3-0.7-0.4-1.2c-0.1-0.5-0.2-1-0.3-1.6s-0.1-1.4-0.2-2.4 c-0.1-2-0.1-3.4,0.1-4.3c0.2-0.9,0.6-1.7,1.2-2.5c0.5-0.6,1.1-1,1.9-1.2s1.9-0.3,3.4-0.4l8-0.5l1.3-0.1c0.8,0,1.5,0,2.1,0 c0.6,0,1.1,0.2,1.5,0.4c0.4,0.2,0.8,0.5,1.1,0.8C776,387,776.3,387.5,776.7,388.1z M771.7,394.8h0.4c1.4-0.1,2.2-0.5,2.1-1.3 c0-0.8-0.8-1.2-2.2-1.1h-0.4l-8.8,0.5h-0.4c-1.4,0.1-2.1,0.6-2.1,1.3c0,0.8,0.8,1.2,2.3,1.1h0.2L771.7,394.8z M788.5,393.9h0.4 c1.1-0.1,1.7-0.5,1.6-1.3c0-0.8-0.7-1.2-1.9-1.1h-0.3l-6.7,0.4h-0.3c-1.2,0.1-1.7,0.6-1.7,1.3c0.1,0.9,0.7,1.2,1.9,1.1h0.3 L788.5,393.9z"
              />
              <path
                className="st46"
                d="M781.2,446.3l6.8,0.5c1.2,0.1,2-0.2,2.1-1s-0.4-1.2-1.5-1.3h-0.4l-10-0.8c0.5,0.8,0.8,1.4,1,2.1 c0.2,0.6,0.2,1.3,0.2,2.1c-0.1,1.7-0.9,3-2.2,3.9c-1.3,0.8-3.1,1.2-5.3,1h-0.5l-10.6-0.8l-1.1-0.1c-2.7-0.3-4.4-1.4-5-3.6 c-0.1-0.3-0.2-0.6-0.2-0.8c0-0.3-0.1-0.6-0.1-0.9c0-0.4,0-0.8,0-1.4c0-0.5,0.1-1.2,0.1-2c0.1-0.9,0.2-1.7,0.2-2.4 c0.1-0.6,0.2-1.1,0.3-1.6c0.1-0.4,0.3-0.8,0.5-1.1c0.2-0.3,0.4-0.6,0.7-0.8c0.7-0.7,1.4-1.2,2.2-1.4c0.7-0.2,1.9-0.2,3.3-0.1 l0.8,0.1l25.9,2.2l1.2,0.1c1.9,0.1,3.2,0.5,4.1,1c0.8,0.5,1.5,1.4,1.9,2.7c0.1,0.2,0.2,0.5,0.2,0.8s0.1,0.6,0,0.9 c0,0.4,0,0.8,0,1.3s-0.1,1.2-0.1,2c-0.1,1.7-0.3,3-0.5,3.7c-0.2,0.7-0.5,1.4-0.9,2.1c-0.6,0.8-1.3,1.3-2.2,1.6 c-0.8,0.3-2,0.4-3.3,0.3h-0.5l-7.4-0.6L781.2,446.3z M771.6,445.5c0.8,0.1,1.4,0,1.7-0.1c0.3-0.1,0.5-0.5,0.5-0.9 c0-0.4-0.1-0.8-0.4-1c-0.3-0.2-0.8-0.3-1.6-0.4l-9.4-0.7c-1-0.1-1.6,0-2.1,0.1c-0.4,0.2-0.6,0.4-0.6,0.9s0.1,0.8,0.5,1 c0.3,0.2,1,0.3,2,0.4h0.4L771.6,445.5z"
              />
              <path
                className="st46"
                d="M755.2,483.8l16.3,12.9c0.6,0.5,1,0.8,1.2,0.8l1.1,0.3l5.6,1.2l0.4,0.1c1.1,0.3,1.9,0,2.1-0.8 c0.2-0.8-0.3-1.3-1.3-1.5l-0.4-0.1l-6.5-1.4l1.5-6.8l7.2,1.6l1.1,0.2c1.2,0.3,2.3,0.7,3,1.4c0.7,0.6,1.1,1.5,1.3,2.6 c0.1,0.6,0.1,1.2,0.1,2c-0.1,0.7-0.3,1.7-0.5,3.1c-0.2,0.9-0.4,1.7-0.6,2.5c-0.2,0.7-0.4,1.2-0.6,1.6c-0.2,0.4-0.4,0.8-0.6,1.1 c-0.2,0.3-0.5,0.6-0.8,0.8c-0.7,0.6-1.5,1-2.4,1.1c-0.8,0.1-2.1,0-3.6-0.4l-5.6-1.2c-1.5-0.3-2.7-0.7-3.6-1.1 c-0.8-0.4-1.9-1-2.9-1.7l-14.1-11.2l-2.1,9l-5.4-1.2l3.6-16L755.2,483.8z"
              />
              <path
                className="st46"
                d="M772.9,511.4l1-3.8l5.3,1.4c-0.2,1.6-0.1,3,0.5,4c0.6,1,1.7,1.9,3.4,2.7l-1.4,5.3l-39.7-11l1.9-6.7 L772.9,511.4z"
              />
              <path
                className="st46"
                d="M745.9,551l-8.5-3.6l-0.3-0.1c-1.2-0.5-2.1-0.4-2.4,0.3c-0.3,0.7,0.2,1.4,1.4,2l0.2,0.1l8.5,3.6l0.4,0.2 c1.1,0.5,2,0.2,2.4-0.9l0.1-0.3l0.7-1.6l5.1,2.2l-0.6,1.3c-0.4,1-0.6,1.7-0.5,2.1c0.1,0.3,0.6,0.7,1.6,1.1l0.5,0.2l5,2.2l0.6,0.2 c1.1,0.5,1.9,0.3,2.2-0.4c0.3-0.7-0.1-1.4-1.4-2l-0.4-0.2l-5.7-2.4l2.7-6.4l6.1,2.6l0.9,0.4c1.4,0.5,2.5,1.1,3,1.6 c0.6,0.5,1,1.3,1.3,2.3c0.2,1,0.1,2.2-0.3,3.5c-0.1,0.2-0.2,0.6-0.4,1c-0.2,0.4-0.4,1-0.7,1.7c-0.4,0.9-0.7,1.6-1,2.3 c-0.3,0.6-0.6,1.1-0.9,1.5c-0.3,0.4-0.6,0.7-0.9,1c-0.3,0.2-0.7,0.4-1,0.6c-0.8,0.3-1.5,0.5-2.3,0.4s-1.7-0.4-3.2-0.9l-0.7-0.3 l-5.1-2.2l-0.6-0.2c-1.4-0.6-2.4-1.2-2.9-2s-0.8-1.6-0.9-3c-1,0.8-2,1.3-2.9,1.4c-0.9,0.1-2.1-0.2-3.6-0.9l-8-3.4l-0.9-0.4 c-1.5-0.7-2.6-1.3-3.2-2.1c-0.6-0.6-1-1.5-1.1-2.6c0-0.3-0.1-0.6,0-1c0-0.3,0.1-0.7,0.2-1.1c0.1-0.4,0.3-0.9,0.5-1.5 c0.2-0.6,0.5-1.2,0.8-2.1c0.7-1.6,1.3-2.8,1.7-3.5c0.5-0.7,1.1-1.2,1.7-1.6c0.8-0.4,1.6-0.6,2.4-0.6c0.8,0,1.7,0.3,2.9,0.7l0.6,0.2 l9.6,4.1L745.9,551z"
              />
              <path
                className="st46"
                d="M737.6,569.3l-8.3-4.1l-0.3-0.1c-1.2-0.6-2.1-0.5-2.4,0.2c-0.4,0.7,0.1,1.4,1.3,2.1l0.2,0.1l8.3,4.1l0.4,0.2 c1.1,0.5,2,0.3,2.4-0.8l0.2-0.3l0.8-1.6l4.9,2.5l-0.6,1.3c-0.5,1-0.7,1.6-0.6,2.1c0.1,0.3,0.6,0.7,1.5,1.2l0.5,0.2l4.9,2.5l0.5,0.3 c1.1,0.5,1.9,0.4,2.2-0.3c0.4-0.7-0.1-1.4-1.2-2.1l-0.4-0.2l-5.6-2.8l3.1-6.3l5.9,2.9l0.9,0.5c1.3,0.6,2.4,1.2,2.9,1.9 s0.9,1.3,1.1,2.3c0.2,1,0,2.2-0.5,3.5c-0.1,0.2-0.2,0.6-0.4,1c-0.2,0.4-0.5,1-0.8,1.6c-0.4,0.9-0.8,1.6-1.1,2.3 c-0.3,0.6-0.7,1.1-1,1.5c-0.3,0.4-0.6,0.7-0.9,0.9c-0.3,0.2-0.7,0.4-1.1,0.6c-0.8,0.3-1.5,0.4-2.3,0.3c-0.7-0.1-1.7-0.5-3.1-1.1 l-0.7-0.3l-4.9-2.5l-0.5-0.3c-1.3-0.7-2.3-1.3-2.8-2.1c-0.5-0.7-0.7-1.7-0.7-3.1c-1.1,0.8-2.1,1.2-3,1.2c-0.9,0-2.1-0.3-3.6-1.1 l-7.8-3.9l-0.9-0.4c-1.5-0.8-2.6-1.5-3.1-2.2c-0.6-0.7-0.9-1.5-1-2.7c0-0.3,0-0.6,0-1c0-0.3,0.1-0.7,0.2-1.1s0.3-0.9,0.6-1.4 c0.2-0.5,0.6-1.2,0.9-2.1c0.8-1.5,1.4-2.8,2-3.4c0.5-0.7,1.1-1.2,1.9-1.5c0.8-0.4,1.6-0.5,2.5-0.4s1.7,0.4,2.9,0.9l0.5,0.3l9.4,4.6 L737.6,569.3z"
              />
              <path
                className="st46"
                d="M731.2,608.4l2.1-3.4l4.7,3c-0.7,1.5-0.9,2.9-0.6,4c0.3,1.1,1.1,2.3,2.5,3.5l-3,4.7L702,598.3l3.7-5.9 L731.2,608.4z"
              />
              <path
                className="st46"
                d="M716.9,624.3l5.6,3.9c1,0.7,1.9,0.7,2.3,0.1c0.5-0.7,0.3-1.3-0.6-2l-0.3-0.2l-8.2-5.8c0,0.9,0,1.7-0.2,2.4 c-0.2,0.6-0.4,1.2-0.8,1.9c-1,1.4-2.3,2.2-3.8,2.3s-3.3-0.5-5.1-1.7l-0.4-0.3l-8.7-6.1l-0.9-0.6c-2.2-1.5-3.1-3.5-2.6-5.7 c0.1-0.3,0.1-0.6,0.2-0.8c0.1-0.2,0.2-0.5,0.4-0.8c0.2-0.3,0.4-0.7,0.7-1.2c0.3-0.5,0.7-1,1.1-1.6c0.5-0.8,1-1.4,1.4-2 c0.4-0.5,0.7-0.9,1.1-1.2c0.3-0.3,0.6-0.6,0.9-0.7c0.3-0.2,0.7-0.3,1-0.4c0.9-0.3,1.9-0.3,2.6-0.1c0.7,0.2,1.7,0.7,2.9,1.5l0.6,0.4 l21.4,14.9l1,0.7c1.5,1,2.5,2.1,3,3s0.6,2,0.3,3.3c0,0.3-0.1,0.5-0.2,0.8c-0.1,0.2-0.2,0.5-0.4,0.8c-0.2,0.3-0.4,0.7-0.7,1.1 c-0.3,0.4-0.6,1-1.1,1.6c-1,1.4-1.7,2.4-2.3,3c-0.5,0.6-1.1,1-1.9,1.3c-0.9,0.4-1.9,0.5-2.7,0.3c-0.9-0.2-2-0.6-3-1.4l-0.4-0.3 l-6.1-4.2L716.9,624.3z M709.1,618.8c0.7,0.5,1.2,0.7,1.5,0.7c0.3,0,0.6-0.1,0.9-0.5c0.3-0.4,0.3-0.7,0.2-1 c-0.1-0.3-0.5-0.7-1.2-1.2l-7.7-5.3c-0.8-0.5-1.4-0.9-1.9-0.9c-0.4-0.1-0.7,0.1-1,0.5c-0.3,0.4-0.3,0.8-0.1,1.1 c0.2,0.3,0.7,0.8,1.4,1.3l0.3,0.2L709.1,618.8z"
              />
              <path
                className="st46"
                d="M671.1,652.6l6.1-6.5l3.8,3.6l16,22.5l-6.7,7.2l-19.6-18.3l-1.4,1.5l-4.1-3.8l1.4-1.5l-6.5-6l4.4-4.8 L671.1,652.6z M675.2,656.4l11.8,10.9l-10.2-12.7L675.2,656.4z"
              />
              <path
                className="st46"
                d="M640.8,678.6l4.9,20.2c0.2,0.8,0.3,1.3,0.5,1.4l0.7,0.9l3.6,4.4l0.3,0.3c0.7,0.9,1.4,1.1,2.1,0.6 c0.6-0.5,0.6-1.2-0.1-2.1l-0.3-0.3l-4.2-5.1l5.4-4.4l4.7,5.8l0.7,0.8c0.8,1,1.3,2,1.4,3c0.2,0.9,0,2-0.5,2.9 c-0.3,0.5-0.6,1-1.1,1.5s-1.2,1.2-2.3,2.1c-0.7,0.6-1.4,1.1-2,1.5s-1,0.7-1.4,0.9c-0.4,0.2-0.8,0.4-1.1,0.5 c-0.3,0.1-0.7,0.1-1.1,0.2c-0.9,0-1.9-0.2-2.6-0.6c-0.7-0.4-1.6-1.3-2.6-2.5l-3.6-4.4c-1-1.2-1.6-2.3-2.2-3.1 c-0.4-0.8-0.8-1.9-1.1-3.2l-4.2-17.5l-7.2,5.9l-3.5-4.3l12.7-10.4L640.8,678.6z"
              />
              <path
                className="st46"
                d="M626.2,703.6l-5.4-7.5l-0.2-0.2c-0.8-1.1-1.5-1.4-2.2-0.9s-0.6,1.3,0.2,2.5l0.1,0.2l5.4,7.5l0.2,0.3 c0.7,1,1.5,1.1,2.5,0.4l0.3-0.2l1.4-1l3.3,4.5l-1.2,0.8c-0.9,0.6-1.3,1.1-1.4,1.5c-0.1,0.3,0.2,0.9,0.8,1.7l0.3,0.4l3.2,4.4 l0.4,0.5c0.7,1,1.4,1.2,2.1,0.7s0.6-1.2-0.2-2.4l-0.3-0.4l-3.6-5l5.7-4.1l3.8,5.2l0.6,0.8c0.9,1.2,1.5,2.2,1.7,3 c0.2,0.8,0.2,1.6,0,2.6c-0.3,1-1,2-2.1,2.9c-0.2,0.2-0.5,0.4-0.8,0.7c-0.4,0.3-0.9,0.6-1.5,1.1c-0.8,0.6-1.5,1-2.1,1.4 c-0.6,0.4-1.1,0.7-1.5,0.9c-0.4,0.2-0.9,0.3-1.3,0.4c-0.4,0-0.8,0-1.2,0c-0.8-0.1-1.5-0.4-2.2-0.8c-0.6-0.4-1.3-1.2-2.3-2.5 l-0.5-0.6l-3.3-4.5l-0.1-0.4c-0.9-1.2-1.4-2.3-1.5-3.1c-0.1-0.8,0.1-1.9,0.7-3.1c-1.3,0.2-2.4,0.1-3.2-0.3 c-0.8-0.4-1.6-1.2-2.7-2.7l-5.1-7.1l-0.6-0.8c-0.9-1.3-1.5-2.5-1.7-3.4c-0.2-0.8-0.1-1.9,0.3-2.9c0.1-0.3,0.3-0.6,0.5-0.9 c0.2-0.3,0.4-0.6,0.7-0.9c0.3-0.3,0.7-0.6,1.2-1s1-0.8,1.7-1.3c1.4-1,2.6-1.7,3.4-2.1c0.8-0.3,1.5-0.5,2.4-0.5 c0.9,0.1,1.6,0.3,2.4,0.7c0.7,0.4,1.3,1.1,2.1,2.2l0.4,0.5l6.2,8.4L626.2,703.6z"
              />
              <path
                className="st46"
                d="M592.4,725.5l-4.6-8.1l-0.1-0.3c-0.7-1.1-1.3-1.5-2.1-1.1c-0.7,0.4-0.7,1.2,0,2.5l0.1,0.2l4.6,8.1l0.2,0.4 c0.6,1,1.4,1.3,2.5,0.7l0.3-0.2l1.5-0.9l2.8,4.8l-1.3,0.7c-0.9,0.5-1.5,1-1.6,1.3c-0.1,0.3,0.1,0.9,0.6,1.9l0.3,0.5l2.7,4.7 l0.3,0.5c0.6,1,1.2,1.4,2,1c0.7-0.4,0.7-1.2,0.1-2.4l-0.2-0.4l-3.1-5.3l6.1-3.4l3.2,5.7l0.5,0.9c0.8,1.3,1.2,2.4,1.3,3.2 c0.1,0.8,0,1.6-0.3,2.6c-0.4,0.9-1.2,1.9-2.4,2.6c-0.2,0.2-0.5,0.3-0.9,0.6c-0.4,0.2-0.9,0.5-1.6,0.9c-0.8,0.5-1.6,0.9-2.3,1.2 c-0.6,0.3-1.2,0.5-1.6,0.7c-0.5,0.1-0.9,0.2-1.3,0.2c-0.4,0-0.8-0.1-1.2-0.1c-0.8-0.2-1.5-0.5-2.1-1s-1.1-1.4-2-2.7l-0.4-0.7 l-2.8-4.8l-0.3-0.5c-0.7-1.3-1.1-2.5-1.1-3.3c0-0.8,0.3-1.9,1.1-3c-1.3,0.1-2.4-0.2-3.1-0.6c-0.7-0.5-1.5-1.4-2.4-2.9l-4.3-7.6 l-0.5-0.8c-0.8-1.4-1.2-2.7-1.3-3.6c-0.1-0.9,0.1-1.9,0.6-2.8c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.5-0.5,0.8-0.8 c0.3-0.3,0.8-0.5,1.3-0.9c0.5-0.3,1.1-0.7,2-1.1c1.5-0.8,2.8-1.4,3.6-1.7c0.8-0.3,1.6-0.3,2.4-0.3c0.9,0.2,1.6,0.5,2.3,1 s1.2,1.3,1.9,2.4l0.3,0.5l5.1,9L592.4,725.5z"
              />
              <path
                className="st46"
                d="M574.7,735l-4.1-8.3c-0.4-0.8-0.7-1.3-1-1.5s-0.7-0.3-1.1-0.1c-0.4,0.2-0.6,0.5-0.6,0.8 c0,0.3,0.1,0.9,0.5,1.6l0.1,0.2l6.5,13.1c0.3,0.6,0.6,1.1,0.9,1.2c0.3,0.2,0.6,0.2,1,0c0.7-0.4,0.9-0.9,0.5-1.7l-0.2-0.5l-0.6-1.2 l6.3-3.1l8.8,17.9l-14.7,7.3l-2.5-4.9l8.4-4.2l-3.2-6.5c-0.5,1.5-1.4,2.7-2.8,3.4c-1.5,0.7-3,0.8-4.4,0.1c-1.4-0.7-2.6-2.1-3.6-4 l-0.3-0.6l-6.8-13.8l-0.5-0.9c-1-2.2-1.1-4-0.3-5.3c0.4-0.7,0.9-1.3,1.5-1.7c0.6-0.5,1.7-1.1,3.3-1.9c0.7-0.4,1.3-0.7,2-0.9 c0.5-0.2,1-0.4,1.4-0.6c0.4-0.1,0.8-0.2,1.1-0.3c0.3-0.1,0.7-0.1,1-0.1c2,0,3.5,1.1,4.5,3.3l0.5,0.9l4.6,9.4L574.7,735z"
              />
              <path
                className="st46"
                d="M546.8,761.3l3.7-1.3l2,5.2c-1.5,0.8-2.5,1.7-3,2.8c-0.4,1.1-0.5,2.5-0.1,4.3l-5.2,2l-14.4-38.6l6.6-2.5 L546.8,761.3z"
              />
              <path
                className="st46"
                d="M521.8,747.7l8.4-2.7l1.6,5l3,27.5l-9.4,3l-8.2-25.5l-2,0.6l-1.7-5.2l2-0.6l-2.7-8.4l6.3-2L521.8,747.7z M523.4,752.9l4.9,15.3l-2.6-16L523.4,752.9z"
              />
              <path
                className="st46"
                d="M478.2,757.2l-6.2,19.8c-0.3,0.8-0.4,1.2-0.3,1.4l0.2,1.1l0.8,5.7l0.1,0.4c0.2,1.1,0.6,1.7,1.4,1.6 c0.8-0.1,1.1-0.7,1-1.9l-0.1-0.4l-0.9-6.6l6.9-1l1,7.3l0.2,1.1c0.2,1.3,0.1,2.4-0.2,3.3c-0.3,0.9-1,1.6-2,2.3 c-0.5,0.3-1.1,0.6-1.7,0.7c-0.7,0.2-1.6,0.4-3.1,0.5c-1,0.1-1.9,0.2-2.5,0.3c-0.7,0.1-1.2,0.1-1.7,0.1s-0.9-0.1-1.2-0.2 c-0.3-0.1-0.7-0.2-1-0.4c-0.8-0.4-1.4-1-1.9-1.9c-0.4-0.8-0.7-2-0.9-3.5l-0.8-5.7c-0.2-1.5-0.3-2.8-0.2-3.7s0.3-2.1,0.6-3.3 l5.4-17.2l-9.2,1.3l-0.8-5.4l16.2-2.4L478.2,757.2z"
              />
              <path
                className="st46"
                d="M422,789v1.5c0,1.3-0.2,2.4-0.5,3.2c-0.3,0.8-1,1.4-1.9,2c-0.3,0.2-0.6,0.3-0.9,0.4c-0.3,0.1-0.7,0.2-1.1,0.3 c-0.4,0.1-0.9,0.1-1.5,0.1s-1.3,0.1-2.2,0.1c-1,0-1.9,0-2.6,0s-1.3-0.1-1.7-0.2c-0.5-0.1-0.9-0.3-1.3-0.5c-0.4-0.2-0.7-0.4-1-0.7 c-0.8-0.8-1.3-1.9-1.5-3.3c0-0.3-0.1-0.6-0.1-0.9c0-0.2,0-0.8,0-1.7l-0.4-26.3c0-0.7,0-1.2,0-1.7c0-0.4,0-0.8,0-1.1 c0-0.3,0.1-0.6,0.1-0.8c0.1-0.2,0.1-0.4,0.2-0.6c0.3-0.7,0.7-1.3,1.3-1.9c0.6-0.5,1.2-0.9,2.1-1.1c0.4-0.1,1-0.2,1.6-0.3 c0.6-0.1,1.5-0.1,2.8-0.1c0.8,0,1.5,0,2.2,0c0.6,0,1.1,0.1,1.5,0.1c0.4,0.1,0.8,0.2,1.1,0.3c0.3,0.1,0.6,0.2,0.9,0.4 c0.8,0.5,1.5,1.1,2,2c0.4,0.8,0.6,1.9,0.6,3.2v1.4L422,789z M412.5,788.2v0.8c0,0.8,0.1,1.3,0.3,1.6c0.2,0.3,0.5,0.4,0.9,0.4 c0.6,0,1-0.4,1.1-1c0-0.2,0.1-0.4,0.1-0.6c0-0.3,0-0.7,0-1.2l-0.4-24.3c0-0.7,0-1.1-0.1-1.4c0-0.2-0.1-0.4-0.1-0.6 c-0.2-0.6-0.6-1-1.1-0.9c-0.8,0-1.2,0.7-1.2,2.2v0.8L412.5,788.2z"
              />
              <path
                className="st46"
                d="M375.3,759.7l-11.4,17.4c-0.5,0.7-0.7,1.1-0.7,1.3l-0.2,1.1l-0.8,5.7l-0.1,0.4c-0.2,1.1,0.2,1.9,1,2 c0.8,0.1,1.3-0.4,1.4-1.4l0.1-0.4l0.9-6.6l6.9,0.9l-1,7.3l-0.1,1.1c-0.2,1.3-0.5,2.4-1.1,3.1c-0.6,0.7-1.4,1.2-2.5,1.5 c-0.5,0.2-1.2,0.2-1.9,0.2c-0.7,0-1.7-0.1-3.1-0.3c-1-0.1-1.9-0.3-2.5-0.4c-0.7-0.1-1.2-0.3-1.7-0.4c-0.4-0.2-0.8-0.3-1.1-0.5 c-0.3-0.2-0.6-0.4-0.9-0.7c-0.7-0.7-1.1-1.4-1.3-2.3c-0.2-0.8-0.1-2.1,0.1-3.6l0.8-5.7c0.2-1.5,0.5-2.8,0.8-3.7 c0.3-0.9,0.8-1.9,1.5-3l10-15l-9.2-1.2l0.7-5.4l16.2,2.3L375.3,759.7z"
              />
              <path
                className="st46"
                d="M349.8,771.6c0.5,0.4,0.9,0.8,1.2,1.1c0.3,0.4,0.5,0.8,0.7,1.2c0.1,0.4,0.2,0.9,0.2,1.5c0,0.5-0.1,1.2-0.2,2 l-0.1,0.5l-1.1,5.7l-0.2,1.2c-0.3,1.4-0.7,2.5-1.3,3.2c-0.6,0.7-1.4,1.2-2.5,1.5c-0.6,0.2-1.2,0.2-2.1,0.2c-0.7-0.1-2-0.3-3.6-0.6 c-1.7-0.3-3-0.7-3.8-1c-0.8-0.3-1.4-0.7-2-1.3c-0.6-0.7-1-1.4-1.1-2.4c-0.1-0.8-0.1-2,0.2-3.4l0.1-0.5l1.2-6.1l0.1-0.5 c0.3-1.3,0.7-2.4,1.3-3.1c0.6-0.7,1.5-1.2,2.7-1.5c-1-0.8-1.7-1.6-2-2.6c-0.2-0.8-0.2-2.1,0.1-3.5l0.2-0.9l1.6-8.4l0.2-0.9 c0.2-1.3,0.6-2.3,1.1-3s1.2-1.2,2.1-1.6c0.3-0.1,0.6-0.2,1-0.3c0.3-0.1,0.7-0.1,1.2-0.1s1,0.1,1.7,0.1c0.6,0.1,1.4,0.2,2.4,0.4 c1.9,0.4,3.3,0.7,4.1,1.2c0.8,0.4,1.5,1,2.1,1.9c0.4,0.7,0.7,1.3,0.7,2.1s-0.1,1.9-0.4,3.4l-1.5,7.9l-0.2,1.2 c-0.2,0.8-0.3,1.4-0.5,2.1c-0.2,0.5-0.4,1-0.7,1.4c-0.3,0.4-0.7,0.7-1.1,0.9C351,771.2,350.5,771.4,349.8,771.6z M341.2,781.7 l-0.1,0.4c-0.2,1.1,0.1,1.7,0.9,2c0.8,0.2,1.3-0.3,1.5-1.5l0.1-0.3l1.3-6.6l0.1-0.3c0.1-1.2-0.1-1.9-0.8-2 c-0.9-0.2-1.4,0.3-1.5,1.5l-0.1,0.3L341.2,781.7z M344.5,765.2l-0.1,0.4c-0.3,1.4,0,2.2,0.8,2.4c0.8,0.2,1.3-0.4,1.6-1.9l0.1-0.4 l1.7-8.7l0.1-0.4c0.2-1.3,0-2.2-0.8-2.3c-0.8-0.2-1.3,0.5-1.6,1.9v0.2L344.5,765.2z"
              />
              <path
                className="st46"
                d="M298.8,750.3l2-5.7l0.1-0.3c0.3-0.9,0.5-1.6,0.4-2.1c-0.1-0.4-0.3-0.7-0.7-0.8c-0.4-0.1-0.8-0.1-1,0.2 c-0.2,0.3-0.6,0.8-0.9,1.6l-0.2,0.5l-3.2,8.9c0.9-0.4,1.7-0.6,2.3-0.6c0.6,0,1.2,0.1,1.9,0.3c1.6,0.6,2.8,1.6,3.4,3.3 c0.2,0.7,0.3,1.4,0.3,2.2c0,0.7-0.3,1.6-0.6,2.8l-0.2,0.6l-3.6,10.3c-0.5,1.4-0.9,2.5-1.4,3.1c-0.4,0.6-1,1-1.7,1.4 c-0.4,0.2-0.8,0.3-1.2,0.4c-0.4,0.1-0.9,0.1-1.3,0c-0.4-0.1-1.1-0.2-1.7-0.4c-0.7-0.2-1.5-0.5-2.6-0.8c-1.5-0.5-2.8-1-3.5-1.4 c-0.7-0.4-1.2-0.8-1.7-1.3c-0.6-0.8-0.9-1.6-1-2.6c-0.1-0.8,0.1-2,0.6-3.4l0.3-0.7l8.9-25.6l0.2-0.5c0.4-1.2,0.9-2.2,1.3-2.8 c0.4-0.6,1-1,1.7-1.3c0.8-0.3,1.7-0.5,2.6-0.4c0.8,0.1,2.1,0.4,3.6,0.9c1.1,0.4,2,0.7,2.7,1c0.7,0.3,1.3,0.6,1.7,0.9 c0.5,0.3,0.8,0.6,1.1,0.9c0.3,0.3,0.5,0.6,0.7,1c0.4,0.7,0.6,1.5,0.6,2.3c0,0.7-0.2,1.6-0.6,2.8l-0.2,0.5L305,753L298.8,750.3z M295.6,759.5l0.1-0.2c0.5-1.3,0.3-2.2-0.4-2.5c-0.4-0.1-0.8-0.1-1,0.1c-0.3,0.2-0.6,0.8-0.8,1.6l-3.1,8.8 c-0.3,0.8-0.4,1.4-0.3,1.7c0.1,0.4,0.3,0.6,0.7,0.8c0.8,0.3,1.4-0.3,1.9-1.6l0.1-0.2L295.6,759.5z"
              />
              <path
                className="st46"
                d="M263.9,727.8l-16.6,12.5c-0.7,0.5-1,0.8-1.1,1l-0.5,1l-2.6,5l-0.2,0.4c-0.5,1-0.4,1.7,0.3,2.2 c0.7,0.4,1.3,0.1,1.9-0.9l0.2-0.4l3.1-5.9l6.2,3.2l-3.4,6.6l-0.5,1c-0.6,1.1-1.3,2.1-2.2,2.5c-0.8,0.5-1.7,0.7-2.9,0.6 c-0.6,0-1.2-0.2-1.9-0.4s-1.5-0.7-2.8-1.3c-0.9-0.4-1.6-0.8-2.3-1.2c-0.6-0.3-1.1-0.6-1.4-0.9c-0.4-0.3-0.7-0.6-0.9-0.9 c-0.2-0.3-0.4-0.6-0.6-0.9c-0.4-0.8-0.6-1.7-0.4-2.6c0.1-0.8,0.5-2,1.2-3.4l2.6-5c0.7-1.3,1.3-2.5,2-3.2c0.6-0.7,1.4-1.5,2.5-2.3 l14.4-10.8l-8.2-4.3l2.6-4.9l14.6,7.6L263.9,727.8z"
              />
              <path
                className="st46"
                d="M227.8,731.5l-3.5,5.9c-0.6,1.1-0.6,1.9,0.1,2.3c0.7,0.4,1.3,0.2,1.9-0.7l0.2-0.4l5.1-8.6 c-0.9,0.1-1.7,0.1-2.4,0s-1.2-0.3-1.9-0.7c-1.4-0.9-2.4-2.2-2.5-3.7c-0.2-1.5,0.3-3.3,1.4-5.2l0.3-0.5l5.4-9.2l0.6-0.9 c1.4-2.3,3.3-3.3,5.4-2.9c0.3,0,0.6,0.1,0.8,0.2c0.3,0.1,0.5,0.2,0.9,0.3c0.4,0.1,0.7,0.4,1.2,0.6c0.5,0.3,1,0.6,1.7,1 c0.8,0.5,1.4,0.9,2.1,1.2c0.5,0.4,0.9,0.7,1.3,1c0.3,0.3,0.6,0.6,0.8,0.9c0.2,0.3,0.3,0.6,0.5,1c0.3,0.9,0.4,1.7,0.3,2.6 c-0.1,0.8-0.6,1.7-1.3,3l-0.4,0.7L233,741.8l-0.6,1c-0.9,1.5-1.9,2.7-2.7,3.2s-2,0.7-3.2,0.5c-0.3,0-0.5-0.1-0.8-0.2 c-0.3-0.1-0.5-0.2-0.9-0.4c-0.3-0.2-0.7-0.4-1.2-0.6c-0.5-0.2-1-0.6-1.7-1c-1.4-0.9-2.6-1.5-3.2-2.1c-0.6-0.5-1.1-1-1.4-1.7 c-0.4-0.9-0.6-1.7-0.5-2.7c0.1-0.9,0.5-2,1.2-3.1l0.3-0.5l3.8-6.4L227.8,731.5z M232.8,723.3c-0.4,0.7-0.6,1.2-0.6,1.6 c0,0.3,0.2,0.6,0.6,0.9c0.4,0.2,0.7,0.3,1,0.1c0.3-0.2,0.7-0.6,1.1-1.3l4.8-8c0.5-0.8,0.8-1.4,0.8-1.9c0-0.4-0.1-0.7-0.5-0.9 c-0.4-0.2-0.8-0.3-1.1,0c-0.3,0.2-0.7,0.7-1.2,1.5l-0.2,0.4L232.8,723.3z"
              />
              <path
                className="st46"
                d="M201.6,703.3l5.7-7.4l0.2-0.2c0.8-1.1,0.9-1.9,0.2-2.4c-0.6-0.5-1.4-0.2-2.3,0.9l-0.1,0.2l-5.7,7.4l-0.3,0.3 c-0.7,1-0.6,1.9,0.3,2.5l0.3,0.2l1.4,1.1l-3.4,4.4l-1.1-0.9c-0.9-0.7-1.5-1-1.9-0.9c-0.4,0-0.8,0.4-1.4,1.2l-0.3,0.4l-3.3,4.4 l-0.4,0.5c-0.7,1-0.8,1.7-0.1,2.3c0.6,0.5,1.4,0.2,2.3-0.9l0.3-0.4l3.7-4.9l5.6,4.2l-3.9,5.2l-0.6,0.8c-0.9,1.2-1.6,2.1-2.4,2.5 c-0.7,0.4-1.5,0.7-2.5,0.7c-1,0-2.2-0.4-3.3-1.1c-0.2-0.1-0.5-0.3-0.9-0.6c-0.4-0.3-0.9-0.7-1.4-1.1c-0.8-0.6-1.4-1.1-2-1.5 s-0.9-0.8-1.3-1.2c-0.3-0.4-0.6-0.7-0.7-1.1c-0.1-0.4-0.3-0.8-0.4-1.2c-0.1-0.8-0.1-1.5,0.2-2.3c0.3-0.7,0.8-1.6,1.6-2.9l0.5-0.6 l3.4-4.4l0.4-0.5c0.9-1.2,1.7-2,2.6-2.4c0.8-0.3,1.9-0.4,3.1-0.1c-0.6-1.2-0.8-2.3-0.6-3.1c0.1-0.8,0.7-2,1.7-3.3l5.3-7l0.6-0.8 c1-1.3,2-2.2,2.8-2.7c0.8-0.4,1.7-0.6,2.8-0.5c0.3,0,0.6,0.1,0.9,0.2s0.7,0.2,1,0.4c0.4,0.2,0.8,0.5,1.3,0.8 c0.5,0.3,1.1,0.8,1.7,1.3c1.4,1,2.4,2,3,2.6s0.9,1.3,1.2,2.1c0.2,0.9,0.2,1.7,0,2.5c-0.2,0.7-0.7,1.6-1.4,2.6l-0.7,0.7l-6.3,8.3 L201.6,703.3z"
              />
              <path
                className="st46"
                d="M180.3,707.8l-1,1.1c-0.8,1-1.6,1.6-2.5,2.1c-0.8,0.3-1.7,0.4-2.7,0.3c-0.3-0.1-0.6-0.1-1-0.3 c-0.3-0.1-0.7-0.3-1-0.5c-0.4-0.2-0.8-0.5-1.2-0.9c-0.5-0.4-1-0.8-1.6-1.3c-0.8-0.6-1.4-1.2-2-1.7s-0.9-0.9-1.2-1.3 c-0.3-0.4-0.5-0.8-0.6-1.2s-0.2-0.8-0.3-1.2c-0.1-1.1,0.2-2.3,1-3.5c0.2-0.3,0.4-0.5,0.5-0.7c0.2-0.2,0.5-0.6,1.1-1.3l17.1-20 c0.4-0.5,0.8-0.9,1.1-1.3c0.3-0.3,0.6-0.6,0.8-0.8c0.2-0.2,0.4-0.4,0.6-0.5c0.2-0.1,0.4-0.2,0.5-0.3c0.7-0.3,1.4-0.5,2.2-0.5 c0.8,0,1.5,0.2,2.3,0.5c0.4,0.2,0.9,0.5,1.4,0.8c0.5,0.4,1.2,0.9,2.2,1.7c0.6,0.5,1.1,1,1.6,1.4s0.8,0.8,1,1.1 c0.3,0.3,0.5,0.6,0.7,0.9c0.2,0.3,0.3,0.6,0.4,0.9c0.3,0.9,0.4,1.9,0.2,2.7c-0.2,0.8-0.7,1.7-1.6,2.8l-0.9,1.1L180.3,707.8z M173.7,700.9l-0.5,0.6c-0.5,0.6-0.8,1-0.8,1.4c-0.1,0.3,0.1,0.7,0.4,0.9c0.5,0.4,1,0.4,1.5-0.1c0.1-0.1,0.3-0.2,0.5-0.4 s0.5-0.5,0.8-0.9l15.7-18.4c0.4-0.5,0.7-0.9,0.9-1.1c0.1-0.2,0.2-0.4,0.3-0.5c0.3-0.6,0.2-1.1-0.2-1.4c-0.6-0.5-1.4-0.2-2.4,0.8 l-0.5,0.6L173.7,700.9z"
              />
              <path
                className="st46"
                d="M148.7,672.5l2.8,2.9l-4,3.8c-1.3-1-2.6-1.6-3.7-1.5c-1.1,0-2.5,0.5-4,1.5l-3.8-4l29.8-28.4l4.8,5 L148.7,672.5z"
              />
              <path
                className="st46"
                d="M139.3,662.5l2.6,3l-4.1,3.7c-1.2-1.1-2.5-1.7-3.7-1.7c-1.1,0-2.6,0.4-4,1.4l-3.7-4.1l30.8-27.2l4.6,5.2 L139.3,662.5z"
              />
              <path
                className="st46"
                d="M97.7,616.8l4.4,6.9l-4.6,3L89.3,614l6-3.8l33.4-11.1l3.8,6L97.7,616.8z"
              />
              <path
                className="st46"
                d="M104.8,570.7L84,570.5c-0.8,0-1.3,0-1.5,0.1l-1,0.5l-5.1,2.4l-0.4,0.2c-1.1,0.5-1.4,1.1-1.1,1.9 c0.3,0.7,1,0.9,2.1,0.4l0.4-0.2l6-2.8l2.9,6.4l-6.7,3.1l-1,0.5c-1.2,0.5-2.3,0.8-3.2,0.7c-0.9-0.1-1.9-0.5-2.7-1.2 c-0.4-0.4-0.8-0.8-1.2-1.4c-0.4-0.6-0.8-1.5-1.4-2.8c-0.4-0.9-0.7-1.6-1-2.3c-0.3-0.6-0.4-1.2-0.6-1.6c-0.1-0.5-0.2-0.9-0.2-1.2 c0-0.3,0-0.7,0.1-1.1c0.2-0.9,0.6-1.7,1.2-2.4c0.6-0.6,1.6-1.2,3.1-1.9l5.1-2.4c1.4-0.6,2.6-1,3.5-1.2c0.9-0.2,2.1-0.3,3.4-0.3 l18,0.3l-3.9-8.4l5-2.4l6.9,14.9L104.8,570.7z"
              />
              <path
                className="st46"
                d="M71.2,562.7l-1.4,0.5c-1.2,0.5-2.3,0.7-3.2,0.6s-1.7-0.4-2.5-1c-0.3-0.2-0.5-0.4-0.7-0.7 c-0.2-0.3-0.4-0.6-0.7-0.9c-0.2-0.4-0.4-0.8-0.7-1.4c-0.2-0.5-0.5-1.2-0.8-2c-0.4-0.9-0.7-1.7-0.9-2.5c-0.2-0.6-0.3-1.2-0.4-1.7 s-0.1-0.9,0-1.3c0.1-0.4,0.2-0.8,0.3-1.2c0.5-1,1.3-2,2.5-2.6c0.3-0.2,0.6-0.3,0.8-0.4c0.2-0.1,0.8-0.3,1.6-0.6l24.5-9.6 c0.6-0.2,1.2-0.4,1.6-0.6c0.4-0.1,0.8-0.3,1.1-0.3c0.3-0.1,0.5-0.1,0.7-0.2c0.2,0,0.4,0,0.6,0c0.7,0,1.4,0.2,2.2,0.6 c0.7,0.4,1.2,0.9,1.7,1.5c0.3,0.4,0.6,0.8,0.8,1.4c0.3,0.6,0.6,1.4,1.1,2.6c0.3,0.7,0.5,1.4,0.7,2s0.3,1,0.4,1.5 c0.1,0.4,0.1,0.8,0.2,1.1c0,0.3,0,0.7-0.1,1c-0.1,1-0.5,1.9-1.1,2.5c-0.6,0.6-1.5,1.2-2.8,1.7l-1.3,0.5L71.2,562.7z M68.8,553.5 l-0.8,0.3c-0.7,0.3-1.2,0.6-1.4,0.8s-0.2,0.6-0.1,1c0.2,0.6,0.7,0.8,1.3,0.6c0.2,0,0.4-0.1,0.6-0.1c0.3-0.1,0.6-0.2,1.2-0.4 l22.5-8.8c0.6-0.2,1.1-0.4,1.3-0.5c0.2-0.1,0.4-0.2,0.5-0.3c0.5-0.4,0.7-0.9,0.5-1.4c-0.3-0.7-1.1-0.9-2.5-0.3l-0.8,0.3L68.8,553.5z"
              />
              <path
                className="st46"
                d="M70.5,510.6l9-2.4l0.3-0.1c1.3-0.3,1.9-0.9,1.6-1.7c-0.2-0.8-1-1-2.4-0.6l-0.2,0.1l-9,2.4l-0.4,0.1 c-1.2,0.3-1.6,1-1.2,2.2l0.1,0.3l0.4,1.7l-5.3,1.4l-0.4-1.4c-0.3-1-0.6-1.7-0.9-1.9c-0.3-0.2-0.9-0.2-2,0.1l-0.5,0.1l-5.3,1.4 l-0.6,0.2c-1.2,0.3-1.6,0.8-1.4,1.6c0.2,0.8,0.9,1,2.3,0.7l0.5-0.1l6-1.5l1.7,6.8l-6.3,1.6l-1,0.3c-1.4,0.4-2.6,0.6-3.4,0.5 s-1.6-0.4-2.4-0.9c-0.8-0.6-1.4-1.6-2-3c-0.1-0.2-0.2-0.6-0.3-1c-0.1-0.4-0.3-1-0.5-1.7c-0.2-0.9-0.4-1.7-0.6-2.5 c-0.1-0.7-0.2-1.2-0.2-1.7c0-0.5,0-0.9,0.1-1.3c0.1-0.4,0.3-0.8,0.4-1.1c0.4-0.7,0.9-1.3,1.5-1.6c0.6-0.4,1.6-0.8,3.1-1.2L52,506 l5.3-1.4l0.6-0.2c1.4-0.4,2.7-0.5,3.5-0.3c0.8,0.2,1.6,0.8,2.6,1.9c0.3-1.3,0.7-2.3,1.4-2.9c0.6-0.6,1.7-1.1,3.4-1.5l8.4-2.3 l0.9-0.2c1.6-0.4,2.9-0.5,3.8-0.4c0.9,0.1,1.7,0.6,2.6,1.3c0.2,0.2,0.4,0.5,0.6,0.7c0.2,0.3,0.4,0.6,0.5,1c0.1,0.4,0.3,0.9,0.5,1.4 c0.2,0.6,0.4,1.3,0.6,2.2c0.4,1.7,0.7,3,0.7,3.9c0,0.9-0.1,1.6-0.3,2.4c-0.4,0.8-0.9,1.4-1.5,2c-0.6,0.5-1.5,0.8-2.8,1.1l-0.6,0.2 l-10.1,2.7L70.5,510.6z"
              />
              <path
                className="st46"
                d="M77.7,495.8l-20.2-4.9c-0.8-0.2-1.3-0.3-1.5-0.3l-1.1,0.2l-5.6,1.1l-0.4,0.1c-1.1,0.2-1.6,0.7-1.5,1.5 c0.2,0.8,0.8,1.1,1.9,0.8l0.4-0.1l6.5-1.3l1.4,6.8l-7.3,1.5l-1.1,0.2c-1.3,0.3-2.4,0.2-3.3,0c-0.9-0.3-1.6-0.9-2.4-1.9 c-0.3-0.5-0.6-1-0.8-1.7c-0.2-0.6-0.5-1.6-0.7-3c-0.2-0.9-0.3-1.7-0.5-2.5c-0.1-0.7-0.2-1.2-0.2-1.7s0-0.9,0.1-1.2 c0.1-0.3,0.2-0.7,0.4-1.1c0.4-0.9,1-1.5,1.7-2c0.7-0.4,1.9-0.8,3.4-1.1l5.6-1.1c1.5-0.3,2.8-0.5,3.7-0.4c0.9,0,2.1,0.2,3.3,0.4 l17.5,4.4l-1.9-9l5.4-1.1l3.3,16L77.7,495.8z"
              />
              <path
                className="st46"
                d="M46.7,455l0.4,3.9l-5.6,0.5c-0.4-1.6-1-2.9-2-3.6c-0.9-0.7-2.3-1.1-4.1-1.2l-0.5-5.6l40.9-4.1l0.7,6.9 L46.7,455z"
              />
              <path
                className="st46"
                d="M39.6,435.9l0.5,8.2l-5.6,0.3l-0.8-15l7-0.4l34.5,6.7l0.4,7L39.6,435.9z"
              />
              <path
                className="st46"
                d="M58.5,387.7l9.3,0.7c0.8,0.1,1.4,0,1.9-0.1c0.4-0.2,0.6-0.4,0.6-0.9c0-0.4-0.1-0.8-0.4-1 c-0.3-0.2-0.9-0.3-1.7-0.4h-0.2l-14.6-1.1c-0.7-0.1-1.2,0-1.5,0.2c-0.3,0.2-0.5,0.5-0.5,0.9c-0.1,0.8,0.3,1.2,1.2,1.3h0.5l1.4,0.1 l-0.5,7L34,392.7l1.3-16.3l5.6,0.4l-0.7,9.5l7.3,0.6c-1.1-1.2-1.5-2.6-1.4-4.1c0.1-1.7,0.8-3,2.2-3.8c1.3-0.8,3.1-1.1,5.3-1 l0.7,0.1l15.3,1.2l1,0.1c2.5,0.2,4,1,4.7,2.5c0.4,0.7,0.6,1.4,0.7,2.3c0.1,0.8,0.1,2.1-0.1,3.7c-0.1,0.8-0.1,1.5-0.2,2.2 c-0.1,0.6-0.1,1.1-0.2,1.5c-0.1,0.4-0.2,0.8-0.3,1.1c-0.1,0.3-0.3,0.6-0.5,0.9c-1,1.6-2.8,2.4-5.1,2.2l-1-0.1l-10.4-0.8L58.5,387.7 z"
              />
              <path
                className="st46"
                d="M74.7,347.1l-16.3-12.7c-0.6-0.5-1-0.8-1.2-0.8l-1.1-0.2l-5.6-1.2l-0.4-0.1c-1.1-0.3-1.9,0-2.1,0.8 c-0.2,0.8,0.3,1.3,1.3,1.5l0.4,0.1l6.5,1.4l-1.5,6.8l-7.2-1.6l-1.1-0.2c-1.2-0.3-2.3-0.7-3-1.4c-0.7-0.6-1.1-1.5-1.3-2.6 c-0.1-0.6-0.1-1.2-0.1-2c0.1-0.7,0.2-1.7,0.5-3.1c0.2-0.9,0.4-1.7,0.6-2.5c0.2-0.7,0.4-1.2,0.5-1.6c0.2-0.4,0.4-0.8,0.6-1.1 s0.5-0.6,0.8-0.8c0.7-0.6,1.5-1,2.4-1.1c0.8-0.1,2.1,0,3.6,0.3l5.6,1.2c1.5,0.3,2.7,0.7,3.6,1.1c0.8,0.4,1.9,1,2.9,1.7l14.1,11.3 l2.1-9l5.4,1.2l-3.6,16L74.7,347.1z"
              />
              <path
                className="st46"
                d="M79,328l-15.6-13.7c-0.6-0.5-1-0.8-1.2-0.9l-1.1-0.3l-5.4-1.5l-0.4-0.1c-1.1-0.3-1.9-0.1-2.1,0.7 c-0.2,0.8,0.2,1.3,1.2,1.6l0.4,0.1l6.4,1.9l-1.9,6.7l-7.1-2.1l-1-0.3c-1.2-0.3-2.3-0.9-2.9-1.5c-0.6-0.7-1-1.5-1.2-2.7 c-0.1-0.6-0.1-1.2,0-2c0.1-0.7,0.3-1.6,0.7-3c0.3-0.9,0.5-1.7,0.7-2.5c0.2-0.6,0.4-1.2,0.6-1.6c0.2-0.4,0.4-0.8,0.7-1 c0.2-0.3,0.5-0.5,0.8-0.8c0.7-0.6,1.5-0.9,2.5-0.9c0.8-0.1,2.1,0.1,3.6,0.5l5.4,1.5c1.5,0.4,2.7,0.8,3.5,1.3c0.8,0.4,1.7,1.1,2.8,2 l13.4,12l2.6-8.9l5.3,1.5l-4.5,15.8L79,328z"
              />
              <path
                className="st46"
                d="M83,281.7l8.6,3.5l0.3,0.1c1.2,0.5,2.1,0.4,2.4-0.4c0.3-0.7-0.2-1.4-1.4-2l-0.2-0.1l-8.6-3.5l-0.4-0.2 c-1.1-0.5-2-0.1-2.4,0.9l-0.1,0.3l-0.7,1.6l-5.1-2.2l0.5-1.3c0.4-1,0.6-1.7,0.4-2.1c-0.1-0.3-0.6-0.7-1.6-1.1l-0.5-0.2l-5-2.1 l-0.6-0.2c-1.1-0.5-1.9-0.3-2.2,0.4c-0.3,0.7,0.2,1.4,1.4,2l0.4,0.2l5.8,2.4l-2.7,6.5l-6.1-2.5l-0.9-0.4c-1.4-0.5-2.5-1.1-3-1.6 c-0.6-0.5-1-1.3-1.3-2.3c-0.3-1-0.2-2.2,0.2-3.5c0.1-0.2,0.2-0.6,0.4-1c0.2-0.4,0.4-1,0.7-1.7c0.4-0.9,0.7-1.6,1-2.4 c0.3-0.6,0.6-1.1,0.9-1.5c0.3-0.4,0.6-0.7,0.9-1c0.3-0.2,0.7-0.5,1-0.6c0.7-0.3,1.5-0.5,2.3-0.4s1.7,0.4,3.2,0.9l0.7,0.3l5.1,2.2 l0.6,0.2c1.4,0.6,2.4,1.2,3,1.9c0.5,0.7,0.8,1.6,0.9,3c1-0.8,2-1.3,2.9-1.4s2.1,0.2,3.7,0.8l8.1,3.3l0.9,0.4c1.5,0.7,2.7,1.3,3.3,2 c0.6,0.6,1,1.5,1.2,2.6c0,0.3,0.1,0.6,0.1,1c0,0.4-0.1,0.7-0.2,1.1c-0.1,0.4-0.3,0.9-0.5,1.5c-0.2,0.6-0.5,1.2-0.8,2.1 c-0.7,1.6-1.2,2.8-1.7,3.5s-1,1.3-1.7,1.6c-0.8,0.4-1.6,0.6-2.4,0.6c-0.8,0-1.7-0.2-2.9-0.7l-0.6-0.2l-9.7-4L83,281.7z"
              />
              <path
                className="st46"
                d="M99,266l-3.8,8l-4.7-2.3l-22.1-16.7l4.2-8.9l24.2,11.5l0.9-1.9l5,2.4l-0.9,1.9l7.9,3.8l-2.8,5.9L99,266z M94,263.6l-14.5-6.9l13.5,9.2L94,263.6z"
              />
              <path
                className="st46"
                d="M96.9,224.8l-2.1,3.4l-4.7-2.9c0.7-1.5,0.9-2.9,0.6-4s-1.1-2.3-2.6-3.5l2.9-4.7l35.2,21.4l-3.6,6L96.9,224.8z"
              />
              <path
                className="st46"
                d="M117.6,216.4l7.7,5.1c0.7,0.5,1.2,0.7,1.6,0.8c0.4,0.1,0.7-0.1,1-0.5c0.2-0.4,0.3-0.7,0.1-1 c-0.2-0.3-0.6-0.7-1.2-1.2l-0.2-0.1l-12.1-8.1c-0.6-0.4-1.1-0.6-1.4-0.6c-0.3,0-0.6,0.2-0.9,0.5c-0.4,0.7-0.3,1.2,0.4,1.7l0.4,0.3 l1.1,0.8l-3.9,5.8l-16.5-11.2l9.2-13.6l4.6,3.1l-5.2,7.8l6.1,4.1c-0.3-1.6-0.1-3.1,0.7-4.3c0.9-1.4,2.3-2.2,3.8-2.3 c1.5-0.1,3.3,0.5,5.1,1.7l0.5,0.4l12.7,8.5l0.8,0.6c2.1,1.3,3,2.9,2.9,4.5c0,0.8-0.1,1.5-0.5,2.4c-0.3,0.7-0.9,1.9-2,3.2 c-0.4,0.7-0.8,1.2-1.2,1.7c-0.3,0.5-0.7,0.9-0.9,1.2c-0.3,0.3-0.6,0.6-0.8,0.8c-0.3,0.2-0.6,0.4-0.8,0.6c-1.7,0.9-3.6,0.7-5.6-0.6 l-0.8-0.6l-8.6-5.9L117.6,216.4z"
              />
              <path
                className="st46"
                d="M152.1,173.3l6.9,6.3l0.2,0.2c1,0.9,1.7,1,2.4,0.4c0.5-0.6,0.3-1.3-0.7-2.4l-0.2-0.2l-6.9-6.3l-0.3-0.3 c-0.9-0.8-1.7-0.8-2.6,0.1l-0.2,0.3l-1.2,1.3l-4.1-3.7l1-1.1c0.7-0.8,1.1-1.4,1.1-1.7c0-0.4-0.4-0.9-1.1-1.5l-0.4-0.4l-4.1-3.7 l-0.4-0.4c-0.9-0.8-1.6-0.9-2.2-0.3c-0.5,0.6-0.3,1.3,0.7,2.3l0.4,0.3l4.6,4.1l-4.6,5.1l-4.8-4.4l-0.8-0.7c-1.1-1-2-1.9-2.3-2.6 c-0.4-0.7-0.5-1.5-0.5-2.6c0.1-1,0.5-2.1,1.4-3.2c0.1-0.2,0.4-0.5,0.7-0.8c0.3-0.4,0.7-0.8,1.2-1.3c0.6-0.7,1.2-1.3,1.7-1.9 s0.9-0.9,1.3-1.2c0.4-0.3,0.8-0.5,1.2-0.6s0.8-0.2,1.2-0.3c0.8-0.1,1.5,0,2.3,0.4c0.6,0.3,1.5,0.9,2.7,2l0.6,0.5l4.1,3.7l0.4,0.4 c1.1,1,1.9,2,2.2,2.8c0.3,0.8,0.2,1.9-0.1,3.1c1.2-0.5,2.3-0.6,3.2-0.4c0.8,0.2,2,0.9,3.2,2.1l6.5,5.9l0.7,0.6 c1.2,1.1,2.1,2.2,2.4,3c0.4,0.8,0.5,1.7,0.3,2.9c-0.1,0.3-0.2,0.6-0.3,0.9s-0.3,0.6-0.5,1c-0.2,0.4-0.5,0.8-0.9,1.2 c-0.4,0.5-0.9,1-1.4,1.6c-1.2,1.3-2.2,2.3-2.9,2.8c-0.7,0.5-1.4,0.8-2.2,1c-0.9,0.1-1.7,0.1-2.5-0.2c-0.7-0.3-1.5-0.8-2.5-1.6 l-0.4-0.4l-7.7-7L152.1,173.3z"
              />
              <path
                className="st46"
                d="M186,154.3l-5.2-20c-0.2-0.8-0.3-1.3-0.5-1.4l-0.7-0.9l-3.6-4.3l-0.3-0.3c-0.7-0.9-1.4-1.1-2.1-0.6 s-0.6,1.2,0.1,2.1l0.3,0.3l4.2,5l-5.3,4.5l-4.7-5.7l-0.7-0.8c-0.8-1-1.3-2-1.5-2.9c-0.2-0.9,0-2,0.5-2.9c0.2-0.5,0.6-1,1.1-1.5 s1.2-1.2,2.3-2.1c0.7-0.6,1.4-1.1,2-1.6c0.5-0.4,1-0.7,1.4-1c0.4-0.2,0.8-0.4,1.1-0.5c0.3-0.1,0.7-0.2,1.1-0.2 c0.9-0.1,1.9,0.1,2.6,0.6c0.7,0.4,1.6,1.2,2.7,2.5l3.6,4.3c1,1.2,1.7,2.3,2.2,3.1c0.4,0.8,0.8,1.9,1.2,3.2l4.4,17.5l7.1-6l3.6,4.2 l-12.5,10.6L186,154.3z"
              />
              <path
                className="st46"
                d="M206,135.1l-7.1,5.3l-3.2-4.2l-11.8-25l7.9-6l16,21.4l1.6-1.2l3.3,4.4l-1.6,1.2l5.2,7.1l-5.2,3.9L206,135.1z M202.6,130.7l-9.7-12.9l7.7,14.4L202.6,130.7z"
              />
              <path
                className="st46"
                d="M232.8,107.2l4.7,8l0.2,0.3c0.7,1.1,1.3,1.5,2.1,1.1c0.7-0.4,0.7-1.2,0-2.5l-0.1-0.2l-4.7-8l-0.2-0.4 c-0.6-1-1.4-1.2-2.5-0.6l-0.3,0.2l-1.5,0.9l-2.8-4.8l1.2-0.7c0.9-0.5,1.4-1,1.5-1.3c0.1-0.3-0.1-0.9-0.6-1.9l-0.3-0.5l-2.8-4.7 l-0.3-0.5c-0.6-1-1.3-1.3-2-0.9c-0.7,0.4-0.7,1.2,0,2.4l0.2,0.4l3.1,5.3l-6,3.5l-3.3-5.7l-0.5-0.9c-0.8-1.3-1.2-2.4-1.4-3.2 c-0.1-0.8,0-1.6,0.3-2.6c0.4-0.9,1.1-1.9,2.3-2.7c0.2-0.2,0.5-0.4,0.9-0.6c0.4-0.2,0.9-0.5,1.6-0.9c0.8-0.5,1.5-0.9,2.2-1.2 c0.6-0.3,1.1-0.5,1.6-0.7s0.9-0.2,1.3-0.2c0.4,0,0.8,0,1.2,0.1c0.8,0.2,1.5,0.5,2.1,1s1.2,1.3,2,2.7l0.4,0.7l2.8,4.8l0.3,0.5 c0.8,1.3,1.1,2.4,1.2,3.3c0,0.8-0.3,1.9-1,3c1.3-0.1,2.4,0.1,3.2,0.6c0.7,0.5,1.5,1.4,2.4,2.9l4.4,7.5l0.5,0.8 c0.8,1.4,1.3,2.7,1.4,3.5c0.1,0.9-0.1,1.9-0.6,2.8c-0.2,0.3-0.3,0.5-0.5,0.8c-0.2,0.3-0.5,0.5-0.8,0.8c-0.3,0.3-0.8,0.6-1.3,0.9 s-1.1,0.7-1.9,1.1c-1.5,0.9-2.7,1.4-3.5,1.7c-0.8,0.3-1.6,0.4-2.4,0.3c-0.9-0.1-1.6-0.4-2.3-0.9c-0.6-0.5-1.2-1.2-1.9-2.4l-0.3-0.5 l-5.2-8.9L232.8,107.2z"
              />
              <path
                className="st46"
                d="M248.2,87.5l-3.1-6.1c-0.6-1.1-1.2-1.5-2-1.1s-0.8,1-0.4,2l0.2,0.4l4.5,8.8c0.4-0.8,0.8-1.5,1.2-2 c0.4-0.5,0.9-0.9,1.6-1.2c1.5-0.8,3-0.8,4.4-0.2c1.4,0.7,2.7,2,3.7,4l0.2,0.5l4.9,9.5l0.5,1c1.2,2.5,1,4.5-0.4,6.2 c-0.2,0.2-0.4,0.4-0.6,0.6s-0.5,0.4-0.8,0.6c-0.3,0.2-0.7,0.4-1.2,0.7s-1,0.6-1.7,0.9c-0.8,0.4-1.5,0.8-2.2,1s-1.1,0.4-1.5,0.6 c-0.4,0.1-0.8,0.2-1.2,0.2c-0.4,0-0.7,0-1.1-0.1c-1-0.2-1.7-0.5-2.4-1.1c-0.6-0.5-1.2-1.4-1.9-2.7l-0.4-0.7l-11.9-23.1l-0.5-1.1 c-0.8-1.6-1.2-3-1.2-4s0.4-2.1,1.2-3c0.2-0.2,0.3-0.4,0.5-0.6s0.5-0.3,0.8-0.5c0.3-0.2,0.7-0.4,1.1-0.7c0.5-0.3,1-0.6,1.7-0.9 c1.5-0.8,2.7-1.3,3.4-1.5c0.7-0.2,1.4-0.3,2.2-0.3c0.9,0.1,1.9,0.4,2.6,1c0.7,0.6,1.3,1.4,2,2.7l0.2,0.5l3.4,6.6L248.2,87.5z M252.5,96c-0.4-0.7-0.7-1.2-1-1.3c-0.3-0.2-0.6-0.2-1,0c-0.4,0.2-0.6,0.5-0.6,0.8s0.1,0.9,0.5,1.6l4.3,8.3 c0.4,0.9,0.8,1.4,1.1,1.6c0.3,0.2,0.7,0.3,1.1,0.1c0.4-0.2,0.6-0.5,0.6-0.9c0-0.4-0.2-1-0.7-1.9l-0.2-0.4L252.5,96z"
              />
              <path
                className="st46"
                d="M280.5,69.6l-3.7,1.4l-2.1-5.1c1.5-0.8,2.5-1.7,2.9-2.9c0.4-1.1,0.5-2.6,0.1-4.3l5.1-2.1L297.7,95l-6.5,2.6 L280.5,69.6z"
              />
              <path
                className="st46"
                d="M302.1,75.4l3,8.8l0.1,0.3c0.4,1.3,1,1.7,1.9,1.5c0.8-0.3,0.9-1,0.5-2.4l-0.1-0.2l-3-8.8l-0.1-0.4 c-0.4-1.1-1.1-1.5-2.3-1.1l-0.3,0.1l-1.6,0.6l-1.7-5.2l1.4-0.5c1-0.3,1.6-0.7,1.9-1c0.2-0.3,0.1-0.9-0.2-2l-0.2-0.5l-1.7-5.2 l-0.2-0.6c-0.4-1.1-1-1.6-1.7-1.3c-0.8,0.3-0.9,1-0.5,2.4l0.2,0.5l2,5.9l-6.6,2.3l-2.1-6.2l-0.3-1c-0.5-1.4-0.8-2.6-0.7-3.4 c0-0.8,0.3-1.6,0.8-2.5c0.6-0.8,1.5-1.5,2.8-2.2c0.2-0.1,0.5-0.2,1-0.4c0.5-0.2,1-0.3,1.7-0.6c0.9-0.3,1.7-0.5,2.5-0.7 c0.7-0.2,1.2-0.3,1.7-0.4c0.5-0.1,0.9,0,1.3,0c0.4,0.1,0.8,0.2,1.2,0.4c0.7,0.3,1.3,0.8,1.7,1.4c0.4,0.6,0.9,1.5,1.4,3l0.2,0.7 l1.7,5.2l0.2,0.6c0.5,1.4,0.6,2.6,0.5,3.4c-0.1,0.8-0.7,1.7-1.6,2.7c1.3,0.2,2.3,0.6,3,1.2c0.6,0.6,1.2,1.7,1.7,3.3l2.8,8.3 l0.3,0.9c0.5,1.6,0.7,2.9,0.6,3.8c-0.1,0.9-0.4,1.7-1.1,2.6c-0.2,0.2-0.4,0.5-0.7,0.7c-0.2,0.2-0.6,0.4-0.9,0.6 c-0.4,0.2-0.9,0.4-1.4,0.6c-0.6,0.2-1.2,0.4-2.1,0.7c-1.6,0.5-3,0.9-3.8,1c-0.9,0.1-1.6,0-2.4-0.2c-0.8-0.3-1.5-0.8-2.1-1.4 c-0.5-0.6-0.9-1.5-1.3-2.7l-0.2-0.6l-3.3-9.9L302.1,75.4z"
              />
              <path
                className="st46"
                d="M351.5,49.8l-3.9,0.6l-0.9-5.4c1.6-0.5,2.8-1.2,3.4-2.2c0.6-1,0.9-2.4,0.9-4.1l5.4-0.9l6.7,40.6l-6.9,1.1 L351.5,49.8z"
              />
              <circle
                cx="414.55"
                cy="414.65"
                r="60"
                className="circle-center-outer"
              />
              <rect
                x="258"
                y="404"
                width="110"
                height="25"
                className="cross-arm-1"
              />
              <rect
                x="458"
                y="404"
                width="110"
                height="25"
                className="cross-arm-2"
              />
              <rect
                x="401"
                y="258"
                width="25"
                height="110"
                className="cross-arm-3"
              />
              <rect
                x="401"
                y="461"
                width="25"
                height="110"
                className="cross-arm-4"
              />

              <circle cx="258" cy="416.5" r="30" className="cross-circle-1" />
              <circle cx="568" cy="416.5" r="30" className="cross-circle-2" />
              <circle cx="413.5" cy="258" r="30" className="cross-circle-3" />
              <circle cx="413.5" cy="571" r="30" className="cross-circle-4" />

              <circle
                cx="258"
                cy="416.5"
                r="20"
                className="cross-circle-inner-1"
              />
              <circle
                cx="568"
                cy="416.5"
                r="20"
                className="cross-circle-inner-2"
              />
              <circle
                cx="413.5"
                cy="258"
                r="20"
                className="cross-circle-inner-3"
              />
              <circle
                cx="413.5"
                cy="571"
                r="20"
                className="cross-circle-inner-4"
              />

              <circle
                cx="414.55"
                cy="414.65"
                r="50"
                className="circle-center"
              />
              <circle
                cx="414.55"
                cy="414.65"
                r="30"
                className="circle-center-inner"
              />
            </g>
          </svg>
        </object>
        <object className="outside">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 456 456"
          >
            <radialGradient
              id="roulette_svg_outside"
              cx="228"
              cy="227.76"
              r="225.5"
              gradientTransform="matrix(1 0 0 -1 0 455.7599)"
              gradientUnits="userSpaceOnUse"
            >
              <stop className="gradient g1" offset="0.8945" />
              <stop className="gradient g2" offset="0.901" />
              <stop className="gradient g3" offset="0.9166" />
              <stop className="gradient g4" offset="0.9387" />
              <stop className="gradient g5" offset="1" />
            </radialGradient>
            <path
              className="st0"
              style={{ fill: "#303030" }}
              d="M451.6,198.5c-1.7-13-4.5-25.5-8.3-37.7c-3.7-12-8.4-23.5-14-34.5c-5.8-11.5-12.6-22.5-20.3-32.8
              c-7.5-10.1-15.8-19.5-24.9-28.2c-9.1-8.7-18.9-16.7-29.4-23.8c-10.5-7.1-21.5-13.4-33.1-18.6c-11.5-5.3-23.5-9.6-36-12.8
              c-12.4-3.3-25.2-5.5-38.4-6.6c-6.3-0.5-12.8-0.8-19.2-0.8c-6.3,0-12.5,0.3-18.6,0.8c-13,1-25.6,3.2-37.9,6.4
              c-12.7,3.3-24.9,7.6-36.6,12.9c-11.5,5.2-22.6,11.4-33,18.5c-10.7,7.2-20.7,15.4-30,24.3c-9.1,8.7-17.5,18.2-25,28.4
              c-7.6,10.2-14.4,21.1-20.1,32.6c-5.5,11-10.2,22.4-14,34.3c-3.8,12.2-6.6,24.9-8.3,37.9C3.2,208.1,2.5,218,2.5,228
              c0,2.8,0,5.5,0.2,8.3c0.5,13.3,2.1,26.3,4.8,38.9c2.7,12.7,6.5,25,11.3,36.9c4.8,12,10.6,23.5,17.3,34.3
              c6.6,10.7,14.1,20.8,22.4,30.2c8.5,9.7,17.9,18.7,28,26.9c9.8,7.9,20.3,15,31.3,21.3c11.2,6.3,23,11.7,35.3,16
              c12,4.2,24.4,7.5,37.1,9.6c12.3,2.1,24.9,3.2,37.8,3.2h0.5c13.3,0,26.2-1.2,38.8-3.4c12.4-2.2,24.5-5.4,36.2-9.5
              c12.2-4.3,23.9-9.7,35-16c11.2-6.3,21.7-13.5,31.6-21.5c9.9-8.1,19.2-17,27.6-26.6c8.4-9.6,16-19.9,22.7-30.8
              c6.7-10.9,12.4-22.4,17.2-34.3c4.6-11.6,8.3-23.8,11-36.3c2.6-12.4,4.2-25.2,4.7-38.2c0.1-2.9,0.2-5.8,0.2-8.8
              C453.5,218,452.9,208.2,451.6,198.5z"
            />
            <path
              className="st0"
              style={{
                fill: "url(#roulette_svg_outside)",
                strokeWidth: 5,
                strokeMiterlimit: 10,
              }}
              d="M451.6,198.5c-1.7-13-4.5-25.5-8.3-37.7c-3.7-12-8.4-23.5-14-34.5c-5.8-11.5-12.6-22.5-20.3-32.8
              c-7.5-10.1-15.8-19.5-24.9-28.2c-9.1-8.7-18.9-16.7-29.4-23.8c-10.5-7.1-21.5-13.4-33.1-18.6c-11.5-5.3-23.5-9.6-36-12.8
              c-12.4-3.3-25.2-5.5-38.4-6.6c-6.3-0.5-12.8-0.8-19.2-0.8c-6.3,0-12.5,0.3-18.6,0.8c-13,1-25.6,3.2-37.9,6.4
              c-12.7,3.3-24.9,7.6-36.6,12.9c-11.5,5.2-22.6,11.4-33,18.5c-10.7,7.2-20.7,15.4-30,24.3c-9.1,8.7-17.5,18.2-25,28.4
              c-7.6,10.2-14.4,21.1-20.1,32.6c-5.5,11-10.2,22.4-14,34.3c-3.8,12.2-6.6,24.9-8.3,37.9C3.2,208.1,2.5,218,2.5,228
              c0,2.8,0,5.5,0.2,8.3c0.5,13.3,2.1,26.3,4.8,38.9c2.7,12.7,6.5,25,11.3,36.9c4.8,12,10.6,23.5,17.3,34.3
              c6.6,10.7,14.1,20.8,22.4,30.2c8.5,9.7,17.9,18.7,28,26.9c9.8,7.9,20.3,15,31.3,21.3c11.2,6.3,23,11.7,35.3,16
              c12,4.2,24.4,7.5,37.1,9.6c12.3,2.1,24.9,3.2,37.8,3.2h0.5c13.3,0,26.2-1.2,38.8-3.4c12.4-2.2,24.5-5.4,36.2-9.5
              c12.2-4.3,23.9-9.7,35-16c11.2-6.3,21.7-13.5,31.6-21.5c9.9-8.1,19.2-17,27.6-26.6c8.4-9.6,16-19.9,22.7-30.8
              c6.7-10.9,12.4-22.4,17.2-34.3c4.6-11.6,8.3-23.8,11-36.3c2.6-12.4,4.2-25.2,4.7-38.2c0.1-2.9,0.2-5.8,0.2-8.8
              C453.5,218,452.9,208.2,451.6,198.5z"
            />
          </svg>
        </object>
      </div>
    </Box>
  );
};
