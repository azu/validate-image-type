# validate-image-type

Check the image file of a Buffer/Uint8Array that matched expected image MIME-type.

This library check the file content instead of file extensions using following:

- [sindresorhus/image-type: Detect the image type of a Buffer/Uint8Array](https://github.com/sindresorhus/image-type)
- [sindresorhus/is-svg: Check if a string or buffer is SVG](https://github.com/sindresorhus/is-svg)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install validate-image-type

## Usage

```ts
import { validateMIMEType } from "validate-image-type";
const result = validateMIMEType("./valid.png", {
    allowMimeTypes: ['image/jpeg', 'image/gif', 'image/png', 'image/svg+xml']
});
if (!result.ok) {
    console.error(result.error);
    return;
}
console.log("This image is valid");
```

## Supported file types 

Basic images file types and SVG(`image/svg+xml`).

See `image-type`'s [Supported file types](https://github.com/sindresorhus/image-type#supported-file-types)

## Changelog

See [Releases page](https://github.com/azu/validate-image-type/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/validate-image-type/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
