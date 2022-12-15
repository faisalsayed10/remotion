import type {ForwardRefExoticComponent, RefAttributes} from 'react';
import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {useFrameForVolumeProp} from '../audio/use-audio-frame';
import {usePreload} from '../prefetch';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {
	DEFAULT_ACCEPTABLE_TIMESHIFT,
	useMediaPlayback,
} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import { useVideoConfig } from '../use-video-config';
import {
	useMediaMutedState,
	useMediaVolumeState,
} from '../volume-position-state';
import type {RemotionMainVideoProps, RemotionVideoProps} from './props';

type VideoForDevelopmentProps = RemotionVideoProps & RemotionMainVideoProps & {
	onlyWarnForMediaSeekingError: boolean;
	onDuration: (src: string, durationInSeconds: number) => void;
};

const VideoForDevelopmentRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	VideoForDevelopmentProps
> = (props, ref) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	const volumePropFrame = useFrameForVolumeProp();
	const {fps} = useVideoConfig();

	const {
		volume,
		muted,
		playbackRate,
		onlyWarnForMediaSeekingError,
		src,
		onDuration,
		acceptableTimeshift,
		startFrom,
		endAt,
		...nativeProps
	} = props;

	const actualVolume = useMediaTagVolume(videoRef);

	const [mediaVolume] = useMediaVolumeState();
	const [mediaMuted] = useMediaMutedState();

	useMediaInTimeline({
		mediaRef: videoRef,
		volume,
		mediaVolume,
		mediaType: 'video',
		src,
	});

	useSyncVolumeWithMediaTag({
		volumePropFrame,
		actualVolume,
		volume,
		mediaVolume,
		mediaRef: videoRef,
	});

	useMediaPlayback({
		mediaRef: videoRef,
		src,
		mediaType: 'video',
		playbackRate: props.playbackRate ?? 1,
		onlyWarnForMediaSeekingError,
		acceptableTimeshift: acceptableTimeshift ?? DEFAULT_ACCEPTABLE_TIMESHIFT,
	});

	let actualSrc = usePreload(src as string);

	const shouldAppendFragment = !actualSrc.startsWith('data:') && !actualSrc.includes('#t=')
	if (shouldAppendFragment) {
		if (typeof startFrom === 'number' && Number.isFinite(startFrom)) {
			actualSrc += `#t=${Math.floor(startFrom/fps)}`

			if (typeof endAt === 'number' && Number.isFinite(endAt) && endAt > startFrom) {
				actualSrc += `,${Math.ceil(endAt/fps)}`
			}
		}
	}

	useImperativeHandle(
		ref,
		() => {
			return videoRef.current as HTMLVideoElement;
		},
		[]
	);

	useEffect(() => {
		const {current} = videoRef;
		if (!current) {
			return;
		}

		const errorHandler = () => {
			if (current?.error) {
				console.error('Error occurred in video', current?.error);
				throw new Error(
					`The browser threw an error while playing the video ${src}: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help`
				);
			} else {
				throw new Error('The browser threw an error');
			}
		};

		current.addEventListener('error', errorHandler, {once: true});
		return () => {
			current.removeEventListener('error', errorHandler);
		};
	}, [src]);

	const currentOnDurationCallback =
		useRef<VideoForDevelopmentProps['onDuration']>();
	currentOnDurationCallback.current = onDuration;

	useEffect(() => {
		const {current} = videoRef;
		if (!current) {
			return;
		}

		if (current.duration) {
			currentOnDurationCallback.current?.(src as string, current.duration);
			return;
		}

		const onLoadedMetadata = () => {
			currentOnDurationCallback.current?.(src as string, current.duration);
		};

		current.addEventListener('loadedmetadata', onLoadedMetadata);
		return () => {
			current.removeEventListener('loadedmetadata', onLoadedMetadata);
		};
	}, [src]);

	return (
		<video
			ref={videoRef}
			muted={muted || mediaMuted}
			playsInline
			src={actualSrc}
			{...nativeProps}
		/>
	);
};

// Copy types from forwardRef but not necessary to remove ref
export const VideoForDevelopment = forwardRef(
	VideoForDevelopmentRefForwardingFunction
) as ForwardRefExoticComponent<
	VideoForDevelopmentProps & RefAttributes<HTMLVideoElement>
>;
