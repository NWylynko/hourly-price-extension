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

function findStringInNode(node: Node, regex: RegExp, callback: (node: Node, match: string) => void) {
  if (node.nodeType === Node.TEXT_NODE) {
    const matches = node.nodeValue?.match(regex) || [];
    matches.forEach((match) => {
      callback(node, match);
    });
  } else {
    node.childNodes.forEach((childNode) => {
      findStringInNode(childNode, regex, callback);
    });
  }
}

const priceRegex = /^\s*\$\s*\d+(\.\d{2})?\s*$/gm; // Simple regex for dollar amounts

// Function to find and replace all price strings on the page
function replacePricesWithHours(hourlyRate: number, showOriginal: boolean) {
  findStringInNode(document.body, priceRegex, (node, match) => {
    const hours = convertPriceToHours(match, hourlyRate);
    // node.nodeValue = hours
    if (showOriginal) {
      node.textContent = `${hours} (${match})`
    } else {
      node.textContent = hours
    }
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
  const { enabled = true } = await chrome.storage.local.get('enabled') as { enabled: boolean | undefined }
  const { showOriginal = false } = await chrome.storage.local.get('showOriginal') as { showOriginal: boolean | undefined }

  if (enabled === false) {
    return;
  }

  if (hourlyRate) {
    replacePricesWithHours(hourlyRate, showOriginal);
  }
}

main()