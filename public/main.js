function isPositiveInteger(value) {
    return value >>> 0 === parseFloat(value);
}

function isPositiveDecimal(value) {
    return /^([0-9]*[.])?[0-9]+$/.test(value) && parseFloat(value) > 0;
  }

function validateFps(fps) {
    return isPositiveInteger(fps) && fps > 0;
}

function validateScale(scale) {
    return scale.toUpperCase() === 'AUTO' || (isPositiveInteger(scale) && scale > 0);
}

function validateStartTimeAndDuration(startTime, duration, videoDuration) {
    if (duration === '') {
        return isPositiveInteger(startTime) && startTime >= 0 && startTime < videoDuration;
    }

    return isPositiveInteger(startTime) && startTime >= 0 &&
        isPositiveInteger(duration) && duration > 0 &&
        Number(startTime) + Number(duration) <= videoDuration;
}
