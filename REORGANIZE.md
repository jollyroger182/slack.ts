# Restructuring for v1.0

Project components:

- [ ] Block kit builder (`blocks/`)
  - [ ] Classes with properties (prototype?)
  - [ ] TSX
- [ ] Web API client (`api/`)
  - [ ] Request function (make testing possible)
  - [ ] Methods
    - [ ] Specific API methods
    - [ ] `slack-undoc-client`
    - [ ] `@slack/web-api`?
- [ ] Events API (`events/`)
  - [ ] Overridden events
  - [ ] `@slack/types`
- [ ] Interactivity (`interactivity/`)
  - [ ] Block actions
  - [ ] Modals
  - [ ] App home
- [ ] Receivers (`receivers/`)
  - [ ] Fetch (needs signing secret and `waitUntil`)
  - [ ] HTTP (needs signing secret, port, path)
  - [ ] Socket mode (needs app token)
  - [ ] Client websocket (needs XOXD + XOXC token)
- [ ] Random types (`types/`)
  - [ ] User
  - [ ] Channel
  - [ ] File
  - [ ] Message
