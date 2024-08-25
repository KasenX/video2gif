function isPositiveInteger(value) {
    return value >>> 0 === parseFloat(value);
}

function validateFps(fps) {
    return isPositiveInteger(fps) && fps > 0;
}

function validateScale(scale) {
    return scale === 'Auto' || (isPositiveInteger(scale) && scale > 0);
}

function validateStartTimeAndDuration(startTime, duration, videoLength) {
    if (duration == null) {
        return isPositiveInteger(startTime) && startTime >= 0 && startTime < videoLength;
    }

    return isPositiveInteger(startTime) && startTime >= 0 &&
        isPositiveInteger(duration) && duration >= 0 &&
        startTime + duration <= videoLength;
}
