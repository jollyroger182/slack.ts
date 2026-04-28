# Canvas API

This markdown file attempts to document the Slack canvas API.

## Init

Called on client load.

Request:

```
POST https://jolly.enterprise.slack.com/canvas/collab/controller-init?format=map
Content-Type: application/x-www-form-urlencoded
Cookie: d=xoxd-...

token=xoxc-...
```

Response:

```
{"user_id": "ETf9EARnapN", "init_options": "CgtFVGY5RUFSbmFwT...", ...}
```

Protobuf-decoded `init_options`:

```
1: "ETf9EARnapN"  # quip user id
2:
  1: "listenweb0.slack-prod.onquip.com"
  2: "/-/listen/2"
  3: "443"
  4: "0"
  5: "1777368069039646"
3:
  2:
    1:
      1: "ETf9EARnapN"
      2: 83479
      6: "U09T3PJB3RC"  # slack user id
      11: 0
      12: "U09T3PJB3RC"
      24: ""
      43:
        1: "AdB9cAkIJKc"  # ???
        2: "E09SQBSDN5V"  # slack enterprise id
        3: ""
      51: "en"
      52: "AdB9cAkIJKc"
      109: -1
      189:
        1: "U09T3PJB3RC"
      ...
26: 1777368667390189
33: "U09T3PJB3RC"
34: "E09SQBSDN5V"
35: "e2c3edc04b2f3fc0df95b909a824a3d4"
```

## Create canvas

Request:

```
POST https://jolly.enterprise.slack.com/canvas/-/call-handler/create-collab-document
Content-Type: application/x-www-form-urlencoded
Cookie: d=xoxd-...

token=xoxc-...
&handler=167
&secret_paths={}
&request_binary=CghVbnRpdGxlZBoqdGVtcDpBOlVXTDEyYzNhMjY1NjhiYTMwODQwYjUzYzAzNzJlN2E5MmE0IiZ0ZW1wOkI5MjE0ZTAwYmIxMzZmN2RhMzUzNjUzYWMyODIzMTAxNEAB
```

Protobuf-decoded `request_binary`:

```
1: "Untitled"  # Canvas title
3: "temp:A:UWL12c3a26568ba30840b53c0372e7a92a4"  # ??
4: "temp:B9214e00bb136f7da353653ac28231014"  # ??
8: 1  # ??
```

Protobuf-decoded response:

```
1:
  2: UWL9AACEeHP  # quip document id or something
2:
  3:
    1: "temp:A:UWL12c3a26568ba30840b53c0372e7a92a4"
    2: "UWL9AACEeHP"
  3:
    1: "temp:B9214e00bb136f7da353653ac28231014"
    2: "UWL9BAKSlxp"
  3:
    1: "Section/temp:A:UWL12c3a26568ba30840b53c0372e7a92a4"
    2: "Section/UWL9BAKSlxp"
  4:
    1: "Section/temp:B9214e00bb136f7da353653ac28231014"
    2: "Section/UWL9BAKSlxp"
  4:
    1: "temp:B9214e00bb136f7da353653ac28231014"
    2: "UWL9BAKSlxp"
  4:
    1: "Section/temp:A:UWL12c3a26568ba30840b53c0372e7a92a4"
    2: "Section/UWL9BAKSlxp"
3:
  1: "UWL9AACEeHP"
  3:
    1: 1
    2: "UWL9AACEeHP"
    3: 1
4:
  2:
    3:
      1: "UWL9AACEeHP"
      2: 3579445  # document version?
      7: "ETf9EARnapN"  # quip user id of creator(?)
      10: "UWL9BAKSlxp"
      11: 0
      14: 0
      21:
        3: 1777368189644185  # created time?
        4: 1777368189644187  # updated time?
        5: "rawrALBVg40K"
      22: 1
      22: 2
      22: 3
      22: 4
      22: 5
      22: 6
      22: 7
      22: 9
      22: 11
      22: 12
      22: 13
      22: 14
      23: 1
      23: 2
      23: 3
      23: 4
      23: 5
      23: 6
      23: 7
      23: 9
      23: 11
      23: 12
      23: 13
      23: 14
      28: 0
      35: 0
      37: 1777368189617842
      40: 1777368189785354
      45: 0
      61: 1777368189481839
      93: 3
      103: 18080900115409910445 (uint)
      104: 10863697537387974148 (uint)
      105: 1
      107: 5
      119: 1
      120: "ETf9EARnapN"
    6:
      1: "UWL9BAKSlxp"
      2: 1602879
      6: "UWL9AACEeHP"
      8: 1777368189734640
      17:
        1: 1
      22: 1
      28: 1
      32: 1
      42: "UWL"
      50:
        1: 0
        2: 0
      51: "5ba93c9db0cff93f52b521d7420e43f6eda2784f"
      57: 0
      59: 1
      70: 1
      102: "UWL9AACEeHP"
      103: 586231036026376043
      104: 10863697537387974148 (uint)
      105: 1
  3:
    1: "Section/UWL9BAKSlxp"
5:
  1:
    1: 2
```

## Load data for editor (1)

Request:

```
POST https://jolly.enterprise.slack.com/canvas/-/load-data/editor/1
Content-Type: application/x-www-form-urlencoded
Cookie: d=xoxd-...

token=xoxc-...&request_binary=CgtBZEI5Y0FrSUpLYyoGZWRpdG9yMAE=
```

Protobuf-decoded `request_binary`:

```
1: "AdB9cAkIJKc"
5: "editor"
6: 1
```

Protobuf-decoded response:

```
2:
  1: 1
  2:
    25:
      1: "AdB9cAkIJKc"
      2: 56466
      6: "E09SQBSDN5V"
      34: 0
      46: 1763225589252314
      103: 16023158709596292833
      104: 0
      184:
        1: "E09SQBSDN5V"
3: ""
```

## Fetch latest

Request (after creating canvas):

```
POST https://jolly.enterprise.slack.com/canvas/-/fetch-latest
Content-Type: application/x-www-form-urlencoded
Cookie: d=xoxd-...

token=xoxc-...&request_binary=ChQKC1VXTDlBQUNFZUhQELW82gEYAA==
```

Protobuf-decoded `request_binary`:

```
1:
  1: "UWL9AACEeHP"
  2: 3579445
  3: 0
```

Protobuf-decoded `request_binary` (for fetching after first edit):

```
1:
  1: "UWL9AACEeHP"
  2: 3579447
  3: 3000
```

Protobuf-decoded response (empty document):

```
1:
  2:
    1: "Section/UWL9BAKSlxp"
    4:
      1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
      2: 0
      3: "aab"
    4:
      1: "temp:C:UWLa779a4380290434789c933903"
      2: 0
      3: "aaa"
    4:
      1: "temp:C:UWL2c72cad6fed24b9dbe27b5e84"
      2: 0
      3: "zzzzzz-orphaned-m"
  7:  # same as 4.2 in "Create canvas" response, except
    3:
      40: 1777368191215315
      61: 1777368191183102
      103: 7296707167141993670
      # ...
    6:
      2: 1602880
      8: 1777368191134678
      48: 3000
      51: "0818822874fcfca3e499fa9d17d6fced17fb1e6c"
      63: "UWL9iACEeHP"
      71:
        1: 0
        2: 0
      72: 1
      103: 10472336407023626956
    7:
      1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
      2: 3000
      6: "UWL9AACEeHP"
      7: "UWL9BAKSlxp"
      8: "aab"
      9: 0
      10: 0
      12:
        1:
          1: "Write something, or get a head start:"
      16:
        4: 0
        13: 1
        30: 5
        34: 1
      21: "aab"
      25: 1
      26: 1777368191062830
      27: 1777368191062830
      29: 0
      30: "ETf9EARnapN"
      31: "ETf9EARnapN"
      32: 1777368191066493
      33: "9d92710cb9b5-0"
      38:
        1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
        2: 0
        3: 3000
        4: 1777368221227609
        5: b"85 6f 4a 83 2c 36 9e 6e 00 c7 01 01 0a 9d 92 71 0c b9 b5 0a 72 a9 a7 01 de 19 81 1b b2 0c 9a 28 e2 13 75 7f 66 01 d2 5f 40 7c c1 32 ff 80 89 3e ad 81 eb f7 78 51 25 61 06 01 02 03 02 13 02 23 06 40 02 56 02 0c 01 04 02 04 11 04 13 07 15 10 21 02 23 05 34 02 42 05 56 07 57 28 80 01 02 7f 00 7f 01 7f 28 7f fc f8 c1 cf 06 7f 00 7f 07 00 02 26 00 00 02 26 01 00 03 25 00 00 02 7e 00 02 24 01 7e 07 64 65 6c 65 74 65 64 04 74 65 78 74 00 26 28 00 7e 28 59 26 01 02 26 7e 01 04 26 01 7e 01 00 25 16 7f 36 57 72 69 74 65 20 73 6f 6d 65 74 68 69 6e 67 2c 20 6f 72 20 67 65 74 20 61 20 68 65 61 64 20 73 74 61 72 74 3a ef bb bf 28 00 00"
        6: "de19811bb20c9a28e213757f6601d25f407cc132ff80893ead81ebf778512561"
        8: "de19811bb20c9a28e213757f6601d25f407cc132ff80893ead81ebf778512561"
        11:
          1: "de19811bb20c9a28e213757f6601d25f407cc132ff80893ead81ebf778512561"
          2: 3000
      105: 1
    7:
      1: "temp:C:UWLa779a4380290434789c933903"
      2: 2000
      6: "UWL9AACEeHP"
      7: "UWL9BAKSlxp"
      8: "aaa"
      9: 64
      10: 48
      12:
        58:
          1: "Untitled"
      16:
        4: 0
        13: 1
        30: 5
        34: 1
      21: "aaa"
      25: 1
      26: 1777368191062830
      27: 1777368191062830
      29: 0
      30: "ETf9EARnapN"
      31: "ETf9EARnapN"
      32: 1777368191066493
      33: "9d92710cb9b5-0"
      105: 1
    7:
      1: "temp:C:UWL2c72cad6fed24b9dbe27b5e84"
      2: 1000
      6: "UWL9AACEeHP"
      7: "UWL9BAKSlxp"
      9: 11
      11: 1
      12:
        10:
          1: 12
          3: "insert"
      14: "insert"
      21: "zzzzzz-orphaned-m"
      25: 1
      26: 1777368191062830
      27: 1777368191062830
      33: "9d92710cb9b5-0"
      105: 1
2: 274393922 (uint)
```

Protobuf-decoded response (after first edit and only when different from above):

```
1:
  2:  # only the first 4 ("aab") remains
    3:
      2: 3579630
      40: 1777371823660480
      61: 1777368191183102
      103: 15789803972907142757
      104: 10863697537387974148
      123: 1777371823417260
      124:
        1: 1777371823417260
        2:
      124:
        1: 1777371823417260
        2:
          1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
          2: 0
        3: "U09T3PJB3RC"
        4: "E09SQBSDN5V"
    6:
      2: 1602960
      8: 1777371823552760
      48: 4000
      51: "7a0831a4273565be20927a269e3c2eff75c7fb19"
      72: 0
      103: 6722854630196422362
    7:
      2: 4000
      12:
        1:
          1: "abcde"
      16:  # 13 and 34 are missing
      27: 1777371823403685
      32: 1777371823407274
      33: "9d92710cb9b5-1"
      38:
        2: 3000
        3: 4000
        4: 1777371853701318
        5: b"85 6f 4a 83 e6 6e cd 5c 00 b9 01 01 0a 9d 92 71 0c b9 b5 0a 72 a9 a7 01 10 8b 5b 4a e2 44 19 92 89 7e e1 bf 82 ef 14 1f f4 20 46 50 8e a0 35 ed 0b 93 03 64 33 56 b8 27 07 01 02 03 02 13 04 23 08 40 04 43 03 56 02 0c 01 04 02 04 11 04 13 0a 15 10 21 02 23 09 34 02 42 05 56 07 57 08 80 01 02 03 00 03 01 7d 04 01 03 7d a7 95 c2 cf 06 01 00 7f 00 02 01 7e 00 01 03 07 00 02 06 00 00 02 06 01 00 03 05 00 00 02 7d 00 02 03 02 01 7f 7b 7e 07 64 65 6c 65 74 65 64 04 74 65 78 74 00 06 08 00 7c 04 7d 01 03 03 01 7f 7b 02 06 7e 01 04 06 01 7e 01 00 05 16 7f 36 61 62 63 64 65 ef bb bf 08 00 02"
        6: "601841f52ceb5f15b2408d6231f88731a69e19c1add4c72d9b34e1e427a44806"
        6: "108b5b4ae2441992897ee1bf82ef141ff42046508ea035ed0b9303643356b827"
        6: "601841f52ceb5f15b2408d6231f88731a69e19c1add4c72d9b34e1e427a44806"
        8: "601841f52ceb5f15b2408d6231f88731a69e19c1add4c72d9b34e1e427a44806"
        11:
          1: "108b5b4ae2441992897ee1bf82ef141ff42046508ea035ed0b9303643356b827"
          2: 4000
2: 1057772897
```

## Edit document

Request (adding text "abcde" to empty document):

```
POST https://jolly.enterprise.slack.com/canvas/-/edit-document
Content-Type: application/x-www-form-urlencoded
Cookie: d=xoxd-...

token=xoxc-...
&document=UWL9BAKSlxp
&nav_action_id=null
&retry_count=0
&search_session_id=null
&secret_path=
&sequence=2
&session=9d92710cb9b5
&thread=UWL9AACEeHP
&title=Untitled
&request_binary=CqsFCiN0ZW1wOk...
```

Protobuf-decoded `request_binary`:

```
1:
  1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
  2: 3000
  8: "aab"
  9: 0
  10: 0
  11: 0
  12:
    1:
      1: "abcde"
  13: ""
  16:
    4: 0
    30: 5
  19: 1
  20: 3
  21: "aab"
  29: 0
  33: "9d92710cb9b5-1"
  35: 0
  38:
    1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
    2: 3000
    3: 3000
    5: b"85 6f 4a 83 e6 6e cd 5c 00 b9 01 01 0a 9d 92 71 0c b9 b5 0a 72 a9 a7 01 10 8b 5b 4a e2 44 19 92 89 7e e1 bf 82 ef 14 1f f4 20 46 50 8e a0 35 ed 0b 93 03 64 33 56 b8 27 07 01 02 03 02 13 04 23 08 40 04 43 03 56 02 0c 01 04 02 04 11 04 13 0a 15 10 21 02 23 09 34 02 42 05 56 07 57 08 80 01 02 03 00 03 01 7d 04 01 03 7d a7 95 c2 cf 06 01 00 7f 00 02 01 7e 00 01 03 07 00 02 06 00 00 02 06 01 00 03 05 00 00 02 7d 00 02 03 02 01 7f 7b 7e 07 64 65 6c 65 74 65 64 04 74 65 78 74 00 06 08 00 7c 04 7d 01 03 03 01 7f 7b 02 06 7e 01 04 06 01 7e 01 00 05 16 7f 36 61 62 63 64 65 ef bb bf 08 00 02"
    6: "601841f52ceb5f15b2408d6231f88731a69e19c1add4c72d9b34e1e427a44806"
    6: "108b5b4ae2441992897ee1bf82ef141ff42046508ea035ed0b9303643356b827"
    6: "601841f52ceb5f15b2408d6231f88731a69e19c1add4c72d9b34e1e427a44806"
    8: "601841f52ceb5f15b2408d6231f88731a69e19c1add4c72d9b34e1e427a44806"
    12: "108b5b4ae2441992897ee1bf82ef141ff42046508ea035ed0b9303643356b827"
14:  # title
  1: "rich_text"
  2:
    1: "rich_text_section"
    2:
      1: "text"
      2: "Untitled"
```

Protobuf-decoded `request_binary` (for appending "1234" to the end of the section):

```
1:
  1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
  2: 4000
  9: 0
  12:
    1:
      1: "abcde1234"
  13: ""
  19: 1
  20: 4
  33: "9d92710cb9b5-2"
  38:
    1: "temp:C:UWL04b8dd9f23b14fd1895d38c4c"
    2: 4000
    3: 4000
    5: b"85 6f 4a 83 b5 ac ff ff 00 c0 01 01 0a 9d 92 71 0c b9 b5 0a 72 a9 a7 01 c5 18 22 3e a0 86 ba 81 fd 0a f1 47 9e 6f 9c 76 80 da 7e 48 41 9a 68 b8 11 6d d0 a7 93 03 ba 27 07 01 02 03 02 13 04 23 08 40 04 43 03 56 02 0c 01 04 02 04 11 04 13 0b 15 10 21 02 23 0b 34 02 42 05 56 07 57 0c 80 01 02 03 00 03 01 7d 09 01 02 7d 87 9a c2 cf 06 00 01 7f 00 02 01 7e 00 01 03 07 00 02 0a 00 00 02 0a 01 00 03 09 00 00 02 7e 00 02 05 01 7d 03 01 7c 7e 07 64 65 6c 65 74 65 64 04 74 65 78 74 00 0a 0c 00 7e 09 78 06 01 7f 03 02 01 7f 7c 02 0a 7e 01 04 0a 01 7e 01 00 09 16 7f 36 61 62 63 64 65 31 32 33 34 ef bb bf 0c 00 02"
    6: "d3bf87fcfdc5b66295a504c5177b6632f595d16d8f79dd1405f32531cbf7c149"
    6: "c518223ea086ba81fd0af1479e6f9c7680da7e48419a68b8116dd0a79303ba27"
    6: "d3bf87fcfdc5b66295a504c5177b6632f595d16d8f79dd1405f32531cbf7c149"
    8: "d3bf87fcfdc5b66295a504c5177b6632f595d16d8f79dd1405f32531cbf7c149"
    12: "c518223ea086ba81fd0af1479e6f9c7680da7e48419a68b8116dd0a79303ba27"
14:
  1: "rich_text"
  2:
    1: "rich_text_section"
    2:
      1: "text"
      2: "Untitled"
```
