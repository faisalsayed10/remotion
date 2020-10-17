import {
	registerVideo,
	spring2,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';

export const Title = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const springConfig: SpringConfig = {
		damping: 10,
		mass: 0.1,
		stiffness: 100,
		restSpeedThreshold: 0.00001,
		restDisplacementThreshold: 0.0001,
		overshootClamping: false,
	};

	const firstWord = spring2({
		config: springConfig,
		from: 0,
		to: 1,
		fps,
		frame,
	});
	const secondWord = spring2({
		config: springConfig,
		frame: Math.max(0, frame - 5),
		from: 0,
		to: 1,
		fps,
	});
	const thirdWord = spring2({
		config: springConfig,
		frame: Math.max(0, frame - 12),
		from: 0,
		to: 1,
		fps,
	});
	return (
		<div
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
			}}
		>
			<div
				style={{
					fontSize: 110,
					fontWeight: 'bold',
					fontFamily: 'SF Pro Text',
				}}
			>
				<span
					style={{
						display: 'inline-block',
						transform: `scale(${firstWord})`,
						marginRight: 25,
					}}
				>
					You're
				</span>
				<span
					style={{transform: `scale(${secondWord})`, display: 'inline-block'}}
				>
					{' '}
					invited
				</span>
			</div>
		</div>
	);
};

registerVideo(Title, {
	fps: 30,
	height: 1080,
	width: 1080,
	durationInFrames: 30,
});