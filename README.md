# StreamShapers Ferryman
![Ferryman](https://github.com/user-attachments/assets/8f55d5b7-b72d-4ba8-9fe9-d00603962931)

### Try it out now: www.ferryman.streamshapers.com
## Description

**StreamShapers Ferryman** is a powerful React-based web application designed to convert Lottie JSON animations into dynamic HTML graphic templates. Compatible with **CasparCG** and **SPX Graphics Controller**, Ferryman empowers broadcasters and designers to create real-time, data-driven HTML graphics seamlessly. This tool bridges the gap between Adobe After Effects animations and professional broadcasting environments.

For detailed instructions, visit our tutorials at [streamshapers.com](https://streamshapers.com).

## Features

- **Lottie JSON to HTML Conversion**  
  Convert Lottie animations into fully functional HTML templates, optimized for compatibility with **CasparCG** and **SPX Graphics Controller**. Perfect for broadcasters requiring real-time graphics.

- **Advanced Analysis Tools**  
  Inspect and test your animations with Ferryman's suite of tools to ensure they perform flawlessly. Analyze markers, layers, and performance in real time.

- **Customization Options**  
  Modify text, images, fonts, and animations effortlessly. Ferryman supports dynamic updates, including integration with **Google Sheets** and a **live clock**.

- **Dynamic Markers and Playback Control**  
  Add `start`, `stop`, `next`, `loop`, and `update` markers directly in Adobe After Effects to control playback and interactivity in your HTML templates.

- **Real-Time Updates**  
  Update animations dynamically during live broadcasts. Change text, images, or data sources on the fly.

- **Seamless Integration**  
  Export templates fully compatible with CasparCG and SPX-GC, ensuring a smooth workflow.

## How It Works

1. **Design:** Create your animation in Adobe After Effects.
2. **Export:** Use the Bodymovin plugin to export your animation as a Lottie JSON file.
3. **Upload:** Drag and drop the Lottie JSON file into Ferryman.
4. **Customize:** Adjust text, images, and markers using Ferryman's tools.
5. **Preview & Export:** Preview the final result and export it as an HTML template.
6. **Ready to go:** You can now use your production ready HTML-graphic template

## Preparing for Ferryman

### Layer Naming
- Use unique names for all layers.
- Prefix dynamic layers with `_` (e.g., `_headline`, `_image`).

### Markers
- Define `start`, `stop`, `next`, `loop`, and `update` markers for precise playback and interactivity.

### External Sources
- Connect text layers to external data sources like **Google Sheets** or a **live clock**.

For detailed preparation steps, refer to the [Prepare for Ferryman Guide](https://streamshapers.com/prepare-for-ferryman).

## Export Options

- **HTML Templates:** Export templates with embedded or separate images.
- **SPX-GC Integration:** Add layer metadata for SPX Graphics Controller compatibility.
- **Debugging:** Use `_templateInfo` and `_debug` keys to analyze and troubleshoot animations.

## Contributing

Contributions to this project are highly encouraged! Whether it's bug fixes, feature enhancements, or documentation improvements, your help is appreciated.

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.  
For more details, see the LICENSE file.

By contributing to this project, you agree to abide by its terms.
