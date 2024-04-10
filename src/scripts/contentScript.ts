
function displayTime(hours: number) {
  if (hours >= 1) {
    // If more than or equal to one hour, display as hours
    const roundedHours = Math.ceil(hours);
    return `${roundedHours} ${roundedHours > 1 ? 'hours' : 'hour'}`;
  } else {
    // If less than an hour, convert to minutes and round up
    const minutes = Math.ceil(hours * 60);
    return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'}`;
  }
}

// Function to convert a price string to work hours
function convertPriceToHours(priceString: string, hourlyRate: number) {
  // Example conversion logic
  const price = parseFloat(priceString.replace(/[^0-9.]/g, ""));
  const hours = price / hourlyRate;
  return displayTime(hours);
}

// Function to find and replace all price strings on the page
function replacePricesWithHours(hourlyRate: number) {
  const priceRegex = /\$\d+(?:\.\d{1,2})?/g; // Simple regex for dollar amounts
  document.body.innerHTML = document.body.innerHTML.replace(priceRegex, function (match) {
    return ` ${convertPriceToHours(match, hourlyRate)}`;
  });
}

// chrome.runtime.onMessage.addListener(function (message) {
//   if (message.type === "rateUpdated") {
//     // Get the updated rate and re-run the replacement function
//     chrome.storage.local.get('hourlyRate', function (data) {
//       if (data.hourlyRate) {
//         replacePricesWithHours(parseFloat(data.hourlyRate));
//       }
//     });
//   }
// });

const main = async () => {
  const { hourlyRate } = await chrome.storage.local.get('hourlyRate') as { hourlyRate: number | undefined }
  const { enabled } = await chrome.storage.local.get('enabled') as { enabled: boolean | undefined }

  if (!enabled) {
    return;
  }

  if (hourlyRate) {
    replacePricesWithHours(hourlyRate);
  }
}

main()