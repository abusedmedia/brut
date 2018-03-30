# Brut

First install

```
npm i
```

Start a dev session

```
grunt dev --app=<path-to-project>
```

Build

```
grunt build --app=<path-to-project>
```

## Configuration

You can add some config within a `brut` key in `package.json` file in your `app` folder.

### Fetch remote json

Add and edit the following chunk of json in `brut` key:

```js
"fetch":{
  "mytest":{
    "files": {
      "app/data/remote_data1.json": "http://jsonplaceholder.typicode.com/posts/1"
    }
  }
}
```