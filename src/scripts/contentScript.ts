// Function to convert a price string to work hours
function convertPriceToHours(priceString: string, hourlyRate: number) {
  // Example conversion logic
  const price = parseFloat(priceString.replace(/[^0-9.]/g, ""));
  return Math.round(price / hourlyRate); // Rounded to 2 decimal places
}

// Function to find and replace all price strings on the page
function replacePricesWithHours(hourlyRate: number) {
  const priceRegex = /\$\d+(?:\.\d{1,2})?/g; // Simple regex for dollar amounts
  document.body.innerHTML = document.body.innerHTML.replace(priceRegex, function (match) {
    return ` ${convertPriceToHours(match, hourlyRate)} hours`;
  });
}

// // Get the user's hourly wage from storage, then find and replace price strings
// chrome.storage.local.get('hourlyRate', function (data) {
//   if (data.hourlyRate) {
//     replacePricesWithHours(parseFloat(data.hourlyRate));
//   }
// });

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