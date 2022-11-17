if (typeof kotlin === 'undefined') {
  throw new Error("Error loading module 'MusicTheory'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to 'MusicTheory'.");
}
var MusicTheory = function (_, Kotlin) {
  'use strict';
  var emptyMap = Kotlin.kotlin.collections.emptyMap_q3lmfv$;
  var toMutableMap = Kotlin.kotlin.collections.toMutableMap_abgq59$;
  var toMap = Kotlin.kotlin.collections.toMap_abgq59$;
  var Kind_CLASS = Kotlin.Kind.CLASS;
  var Map = Kotlin.kotlin.collections.Map;
  var to = Kotlin.kotlin.to_ujzrz7$;
  var reversed = Kotlin.kotlin.collections.reversed_7wnvza$;
  var equals = Kotlin.equals;
  var listOf = Kotlin.kotlin.collections.listOf_i5x0yv$;
  var Kind_OBJECT = Kotlin.Kind.OBJECT;
  var sortedWith = Kotlin.kotlin.collections.sortedWith_eknfly$;
  var wrapFunction = Kotlin.wrapFunction;
  var Comparator = Kotlin.kotlin.Comparator;
  var drop = Kotlin.kotlin.text.drop_6ic1pp$;
  var plus = Kotlin.kotlin.collections.plus_qloxvw$;
  var last = Kotlin.kotlin.collections.last_2p1efm$;
  var dropLast = Kotlin.kotlin.collections.dropLast_yzln2o$;
  var toBoxedChar = Kotlin.toBoxedChar;
  var collectionSizeOrDefault = Kotlin.kotlin.collections.collectionSizeOrDefault_ba2ldo$;
  var ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_ww73n8$;
  var UnsupportedOperationException_init = Kotlin.kotlin.UnsupportedOperationException_init_pdl1vj$;
  var copyToArray = Kotlin.kotlin.collections.copyToArray;
  var emptyList = Kotlin.kotlin.collections.emptyList_287e2$;
  var toString = Kotlin.toString;
  var Exception_init = Kotlin.kotlin.Exception_init_pdl1vj$;
  var Exception = Kotlin.kotlin.Exception;
  var unboxChar = Kotlin.unboxChar;
  var mapOf = Kotlin.kotlin.collections.mapOf_qfcya0$;
  var joinToString = Kotlin.kotlin.collections.joinToString_fmv235$;
  var iterator = Kotlin.kotlin.text.iterator_gw00vp$;
  Either$Left.prototype = Object.create(Either.prototype);
  Either$Left.prototype.constructor = Either$Left;
  Either$Right.prototype = Object.create(Either.prototype);
  Either$Right.prototype.constructor = Either$Right;
  NoteException.prototype = Object.create(Exception.prototype);
  NoteException.prototype.constructor = NoteException;
  ChordException.prototype = Object.create(Exception.prototype);
  ChordException.prototype.constructor = ChordException;
  KeyException.prototype = Object.create(Exception.prototype);
  KeyException.prototype.constructor = KeyException;
  function BiMap(direct) {
    this.direct_0 = direct;
    var tmp$;
    var res = toMutableMap(emptyMap());
    tmp$ = this.direct_0.entries.iterator();
    while (tmp$.hasNext()) {
      var pair = tmp$.next();
      var key = pair.value;
      var value = pair.key;
      res.put_xwzc9p$(key, value);
    }
    this.reverse = toMap(res);
  }
  Object.defineProperty(BiMap.prototype, 'entries', {
    configurable: true,
    get: function () {
      return this.direct_0.entries;
    }
  });
  Object.defineProperty(BiMap.prototype, 'keys', {
    configurable: true,
    get: function () {
      return this.direct_0.keys;
    }
  });
  Object.defineProperty(BiMap.prototype, 'size', {
    configurable: true,
    get: function () {
      return this.direct_0.size;
    }
  });
  Object.defineProperty(BiMap.prototype, 'values', {
    configurable: true,
    get: function () {
      return this.direct_0.values;
    }
  });
  BiMap.prototype.isEmpty = function () {
    return this.direct_0.isEmpty();
  };
  BiMap.prototype.get_11rb$ = function (key) {
    return this.direct_0.get_11rb$(key);
  };
  BiMap.prototype.containsValue_11rc$ = function (value) {
    return this.direct_0.containsValue_11rc$(value);
  };
  BiMap.prototype.containsKey_11rb$ = function (key) {
    return this.direct_0.containsKey_11rb$(key);
  };
  BiMap.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'BiMap',
    interfaces: [Map]
  };
  var compareBy$lambda = wrapFunction(function () {
    var compareValues = Kotlin.kotlin.comparisons.compareValues_s00gnj$;
    return function (closure$selector) {
      return function (a, b) {
        var selector = closure$selector;
        return compareValues(selector(a), selector(b));
      };
    };
  });
  function Chord(note, type) {
    Chord$Companion_getInstance();
    this.note = note;
    this.type = type;
    if (!Chord$Companion_getInstance().chordTypes.contains_11rb$(this.type))
      throw new ChordException(this.note, this.type);
    this.name = this.note.name + this.type;
  }
  function Chord$Companion() {
    Chord$Companion_instance = this;
    this.chordTypes = listOf(['', 'm', '7', 'm7', 'maj7', 'mmaj7', 'dim', 'sus4', 'sus2', 'dim7', '+5', '\xF8']);
  }
  function Chord$Companion$chordFromString$lambda(it) {
    return it.length;
  }
  Chord$Companion.prototype.chordFromString_61zpoe$ = function (name) {
    var tmp$ = Note$Companion_getInstance().noteFromString_61zpoe$(name);
    var note = tmp$.component1()
    , last_name = tmp$.component2();
    if (note == null)
      return to(null, name);
    var tmp$_0;
    tmp$_0 = reversed(sortedWith(this.chordTypes, new Comparator(compareBy$lambda(Chord$Companion$chordFromString$lambda)))).iterator();
    while (tmp$_0.hasNext()) {
      var element = tmp$_0.next();
      var tmp$_1 = last_name.length >= element.length;
      if (tmp$_1) {
        var endIndex = element.length;
        tmp$_1 = equals(last_name.substring(0, endIndex), element);
      }
      if (tmp$_1) {
        var tmp$_2 = new Chord(note, element);
        var startIndex = element.length;
        return to(tmp$_2, last_name.substring(startIndex));
      }
    }
    return to(null, name);
  };
  Chord$Companion.prototype.chordFromName_61zpoe$ = function (name) {
    var tmp$ = this.chordFromString_61zpoe$(name);
    var chord = tmp$.component1()
    , rest = tmp$.component2();
    if (chord == null || !equals(rest, ''))
      throw new ChordException(void 0, void 0, name, 'Strict cast failed');
    return chord;
  };
  Chord$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Chord$Companion_instance = null;
  function Chord$Companion_getInstance() {
    if (Chord$Companion_instance === null) {
      new Chord$Companion();
    }
    return Chord$Companion_instance;
  }
  Chord.prototype.transpose_gyj958$ = function (origin, target) {
    return new Chord(this.note.transpose_gyj958$(origin, target), this.type);
  };
  Chord.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Chord',
    interfaces: []
  };
  function Chord_init(chord, $this) {
    $this = $this || Object.create(Chord.prototype);
    Chord.call($this, chord.note, chord.type);
    return $this;
  }
  function Chord_init_0(name, $this) {
    $this = $this || Object.create(Chord.prototype);
    Chord_init(Chord$Companion_getInstance().chordFromName_61zpoe$(name), $this);
    return $this;
  }
  function ChordsText(list) {
    ChordsText$Companion_getInstance();
    this.list = list;
  }
  function ChordsText$Companion() {
    ChordsText$Companion_instance = this;
  }
  ChordsText$Companion.prototype.fromPlainText_61zpoe$ = function (text) {
    return ChordsText_init(PlainTextAPI$Companion_getInstance().musicTextFromPlainText_61zpoe$(text));
  };
  ChordsText$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var ChordsText$Companion_instance = null;
  function ChordsText$Companion_getInstance() {
    if (ChordsText$Companion_instance === null) {
      new ChordsText$Companion();
    }
    return ChordsText$Companion_instance;
  }
  ChordsText.prototype.toString = function () {
    var $receiver = this.list;
    var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
    var tmp$;
    tmp$ = $receiver.iterator();
    while (tmp$.hasNext()) {
      var item = tmp$.next();
      var tmp$_0 = destination.add_11rb$;
      var transform$result;
      if (Kotlin.isType(item, Either$Left)) {
        transform$result = item.value.name;
      } else if (Kotlin.isType(item, Either$Right)) {
        transform$result = item.value;
      } else {
        transform$result = Kotlin.noWhenBranchMatched();
      }
      tmp$_0.call(destination, transform$result);
    }
    var iterator = destination.iterator();
    if (!iterator.hasNext())
      throw UnsupportedOperationException_init("Empty collection can't be reduced.");
    var accumulator = iterator.next();
    while (iterator.hasNext()) {
      accumulator = accumulator + iterator.next();
    }
    return accumulator;
  };
  ChordsText.prototype.transpose_gyj958$ = function (origin, target) {
    var $receiver = this.list;
    var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
    var tmp$;
    tmp$ = $receiver.iterator();
    while (tmp$.hasNext()) {
      var item = tmp$.next();
      var tmp$_0 = destination.add_11rb$;
      var transform$result;
      if (Kotlin.isType(item, Either$Left)) {
        transform$result = eitherLeft(item.value.transpose_gyj958$(origin, target));
      } else if (Kotlin.isType(item, Either$Right)) {
        transform$result = item;
      } else {
        transform$result = Kotlin.noWhenBranchMatched();
      }
      tmp$_0.call(destination, transform$result);
    }
    return new ChordsText(destination);
  };
  ChordsText.prototype.transposeReducingSpaces_gyj958$ = function (origin, target) {
    var array = copyToArray(this.list);
    var destination = ArrayList_init(array.length);
    var tmp$, tmp$_0;
    var index = 0;
    for (tmp$ = 0; tmp$ !== array.length; ++tmp$) {
      var item = array[tmp$];
      var tmp$_1 = destination.add_11rb$;
      var index_0 = (tmp$_0 = index, index = tmp$_0 + 1 | 0, tmp$_0);
      var transform$result;
      if (Kotlin.isType(item, Either$Left)) {
        var newChord = item.value.transpose_gyj958$(origin, target);
        switch (newChord.name.length - item.value.name.length | 0) {
          case 1:
            if ((index_0 + 1 | 0) < array.length) {
              var nextElement = array[index_0 + 1 | 0];
              if (Kotlin.isType(nextElement, Either$Right) && nextElement.value.charCodeAt(0) === 32)
                array[index_0 + 1 | 0] = eitherRight(drop(nextElement.value, 1));
            }

            break;
          case -1:
            if ((index_0 + 1 | 0) < array.length) {
              var nextElement_0 = array[index_0 + 1 | 0];
              if (Kotlin.isType(nextElement_0, Either$Right)) {
                var other = nextElement_0.value;
                array[index_0 + 1 | 0] = eitherRight(String.fromCharCode(32) + other);
              }
            }

            break;
        }
        transform$result = eitherLeft(newChord);
      } else if (Kotlin.isType(item, Either$Right)) {
        transform$result = item;
      } else {
        transform$result = Kotlin.noWhenBranchMatched();
      }
      tmp$_1.call(destination, transform$result);
    }
    return new ChordsText(destination);
  };
  ChordsText.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ChordsText',
    interfaces: []
  };
  function ChordsText_init(text, $this) {
    $this = $this || Object.create(ChordsText.prototype);
    ChordsText$Companion_getInstance();
    var tmp$;
    var restText = text;
    var resultList = emptyList();
    while (restText.length > 0) {
      var tmp$_0 = Chord$Companion_getInstance().chordFromString_61zpoe$(restText);
      var chord = tmp$_0.component1()
      , newRestText = tmp$_0.component2();
      if (chord != null) {
        resultList = plus(resultList, eitherLeft(chord));
        restText = newRestText;
      } else {
        if (resultList.isEmpty())
          tmp$ = plus(resultList, eitherRight(String.fromCharCode(restText.charCodeAt(0))));
        else {
          var last_0 = last(resultList);
          if (Kotlin.isType(last_0, Either$Left))
            tmp$ = plus(resultList, eitherRight(String.fromCharCode(restText.charCodeAt(0))));
          else if (Kotlin.isType(last_0, Either$Right))
            tmp$ = plus(dropLast(resultList, 1), eitherRight(last_0.value + String.fromCharCode(toBoxedChar(restText.charCodeAt(0)))));
          else
            tmp$ = Kotlin.noWhenBranchMatched();
        }
        resultList = tmp$;
        restText = restText.substring(1);
      }
    }
    if (resultList.isEmpty())
      resultList = plus(resultList, eitherRight(''));
    ChordsText.call($this, resultList);
    return $this;
  }
  function Either() {
  }
  function Either$Left(value) {
    Either.call(this);
    this.value = value;
  }
  Either$Left.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Left',
    interfaces: [Either]
  };
  Either$Left.prototype.component1 = function () {
    return this.value;
  };
  Either$Left.prototype.copy_11rb$ = function (value) {
    return new Either$Left(value === void 0 ? this.value : value);
  };
  Either$Left.prototype.toString = function () {
    return 'Left(value=' + Kotlin.toString(this.value) + ')';
  };
  Either$Left.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.value) | 0;
    return result;
  };
  Either$Left.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && Kotlin.equals(this.value, other.value))));
  };
  function Either$Right(value) {
    Either.call(this);
    this.value = value;
  }
  Either$Right.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Right',
    interfaces: [Either]
  };
  Either$Right.prototype.component1 = function () {
    return this.value;
  };
  Either$Right.prototype.copy_11rc$ = function (value) {
    return new Either$Right(value === void 0 ? this.value : value);
  };
  Either$Right.prototype.toString = function () {
    return 'Right(value=' + Kotlin.toString(this.value) + ')';
  };
  Either$Right.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.value) | 0;
    return result;
  };
  Either$Right.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && Kotlin.equals(this.value, other.value))));
  };
  Either.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Either',
    interfaces: []
  };
  function eitherLeft($receiver) {
    return new Either$Left($receiver);
  }
  function eitherRight($receiver) {
    return new Either$Right($receiver);
  }
  function NoteException(noteId, natural, noteName, message) {
    if (noteId === void 0)
      noteId = null;
    if (natural === void 0)
      natural = null;
    if (noteName === void 0)
      noteName = null;
    if (message === void 0)
      message = null;
    Exception_init('Exception: note id ' + toString(noteId) + ', natural ' + toString(natural) + ', note name ' + toString(noteName) + ', message: ' + toString(message), this);
    this.noteId = noteId;
    this.natural = natural;
    this.noteName = noteName;
    this.name = 'NoteException';
  }
  NoteException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NoteException',
    interfaces: [Exception]
  };
  function ChordException(note, type, chordName, message) {
    if (note === void 0)
      note = null;
    if (type === void 0)
      type = null;
    if (chordName === void 0)
      chordName = null;
    if (message === void 0)
      message = null;
    Exception_init('Exception: note ' + toString(note != null ? note.name : null) + ', type ' + toString(type) + ', chord name ' + toString(chordName) + ', message: ' + toString(message), this);
    this.note = note;
    this.type = type;
    this.chordName = chordName;
    this.name = 'ChordException';
  }
  ChordException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ChordException',
    interfaces: [Exception]
  };
  function KeyException(message) {
    Exception_init(message, this);
    this.message_cvfanm$_0 = message;
    this.name = 'KeyException';
  }
  Object.defineProperty(KeyException.prototype, 'message', {
    get: function () {
      return this.message_cvfanm$_0;
    }
  });
  KeyException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'KeyException',
    interfaces: [Exception]
  };
  var compareBy$lambda_0 = wrapFunction(function () {
    var compareValues = Kotlin.kotlin.comparisons.compareValues_s00gnj$;
    return function (closure$selector) {
      return function (a, b) {
        var selector = closure$selector;
        return compareValues(selector(a), selector(b));
      };
    };
  });
  function Key(tonic, mode) {
    Key$Companion_getInstance();
    this.tonic = tonic;
    this.mode = mode;
    this.name = this.tonic.name + this.mode;
  }
  function Key$Companion() {
    Key$Companion_instance = this;
    this.modes = listOf(['', 'm']);
  }
  function Key$Companion$keyFromString$lambda(it) {
    return it.length;
  }
  Key$Companion.prototype.keyFromString_61zpoe$ = function (name) {
    var tmp$ = Note$Companion_getInstance().noteFromString_61zpoe$(name);
    var note = tmp$.component1()
    , last_name = tmp$.component2();
    if (note == null)
      return to(null, name);
    var tmp$_0;
    tmp$_0 = reversed(sortedWith(this.modes, new Comparator(compareBy$lambda_0(Key$Companion$keyFromString$lambda)))).iterator();
    while (tmp$_0.hasNext()) {
      var element = tmp$_0.next();
      var tmp$_1 = last_name.length >= element.length;
      if (tmp$_1) {
        var endIndex = element.length;
        tmp$_1 = equals(last_name.substring(0, endIndex), element);
      }
      if (tmp$_1) {
        var tmp$_2 = new Key(note, element);
        var startIndex = element.length;
        return to(tmp$_2, last_name.substring(startIndex));
      }
    }
    return to(null, name);
  };
  Key$Companion.prototype.keyFromName_61zpoe$ = function (name) {
    var tmp$ = this.keyFromString_61zpoe$(name);
    var key = tmp$.component1()
    , rest = tmp$.component2();
    if (key == null || !equals(rest, ''))
      throw new KeyException('titovtima.MusicTheory.Key name = ' + name + ', Strict cast failed');
    return key;
  };
  Key$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Key$Companion_instance = null;
  function Key$Companion_getInstance() {
    if (Key$Companion_instance === null) {
      new Key$Companion();
    }
    return Key$Companion_instance;
  }
  Key.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Key',
    interfaces: []
  };
  function Key_init(key, $this) {
    $this = $this || Object.create(Key.prototype);
    Key.call($this, key.tonic, key.mode);
    return $this;
  }
  function Key_init_0(name, $this) {
    $this = $this || Object.create(Key.prototype);
    Key_init(Key$Companion_getInstance().keyFromName_61zpoe$(name), $this);
    return $this;
  }
  function Note(noteId, natural) {
    Note$Companion_getInstance();
    this.noteId = (noteId + 1200 | 0) % 12 | 0;
    this.natural = (natural + 700 | 0) % 7 | 0;
    var tmp$;
    tmp$ = Note$Companion_getInstance().nameFromId_vux9f0$(this.noteId, this.natural);
    if (tmp$ == null) {
      throw new NoteException(this.noteId, this.natural);
    }
    this.name = tmp$;
  }
  function Note$Companion() {
    Note$Companion_instance = this;
    this.sharp = toBoxedChar(9839);
    this.flat = toBoxedChar(9837);
    this.doubleSharp = '\uD834\uDD2A';
    this.doubleFlat = '\uD834\uDD2B';
    this.naturalToId = new BiMap(mapOf([to(0, 0), to(1, 2), to(2, 4), to(3, 5), to(4, 7), to(5, 9), to(6, 11)]));
    this.naturalToName = new BiMap(mapOf([to(0, toBoxedChar(67)), to(1, toBoxedChar(68)), to(2, toBoxedChar(69)), to(3, toBoxedChar(70)), to(4, toBoxedChar(71)), to(5, toBoxedChar(65)), to(6, toBoxedChar(66))]));
  }
  Note$Companion.prototype.nameFromId_vux9f0$ = function (noteId, natural) {
    var tmp$, tmp$_0, tmp$_1;
    tmp$ = unboxChar(this.naturalToName.get_11rb$(natural));
    if (tmp$ == null) {
      return null;
    }
    var naturalName = tmp$;
    tmp$_0 = this.naturalToId.get_11rb$(natural);
    if (tmp$_0 == null) {
      return null;
    }
    var naturalId = tmp$_0;
    switch ((noteId - naturalId + 12 | 0) % 12 | 0) {
      case 10:
        tmp$_1 = this.doubleFlat;
        break;
      case 11:
        tmp$_1 = String.fromCharCode(unboxChar(this.flat));
        break;
      case 0:
        tmp$_1 = '';
        break;
      case 1:
        tmp$_1 = String.fromCharCode(unboxChar(this.sharp));
        break;
      case 2:
        tmp$_1 = this.doubleSharp;
        break;
      default:
        return null;
    }
    var other = tmp$_1;
    return String.fromCharCode(naturalName) + other;
  };
  Note$Companion.prototype.noteFromString_61zpoe$ = function (name) {
    var tmp$, tmp$_0, tmp$_1;
    if (name.length === 0)
      return to(null, name);
    var naturalChar = name.charCodeAt(0);
    tmp$ = this.naturalToName.reverse.get_11rb$(toBoxedChar(naturalChar));
    if (tmp$ == null) {
      return to(null, name);
    }
    var natural = tmp$;
    tmp$_0 = this.naturalToId.get_11rb$(natural);
    if (tmp$_0 == null) {
      return to(null, name);
    }
    var noteId = tmp$_0;
    if (name.length >= 2 && name.charCodeAt(1) === unboxChar(this.sharp)) {
      tmp$_1 = to(new Note(noteId + 1 | 0, natural), name.substring(2));
    } else if (name.length >= 2 && name.charCodeAt(1) === unboxChar(this.flat)) {
      tmp$_1 = to(new Note(noteId - 1 | 0, natural), name.substring(2));
    } else {
      var tmp$_2 = name.length >= 3;
      if (tmp$_2) {
        tmp$_2 = equals(name.substring(1, 3), this.doubleSharp);
      }
      if (tmp$_2) {
        tmp$_1 = to(new Note(noteId + 2 | 0, natural), name.substring(3));
      } else {
        var tmp$_3 = name.length >= 3;
        if (tmp$_3) {
          tmp$_3 = equals(name.substring(1, 3), this.doubleFlat);
        }
        if (tmp$_3) {
          tmp$_1 = to(new Note(noteId - 2 | 0, natural), name.substring(3));
        } else {
          tmp$_1 = to(new Note(noteId, natural), name.substring(1));
        }
      }
    }
    return tmp$_1;
  };
  Note$Companion.prototype.noteFromName_61zpoe$ = function (name) {
    var tmp$ = this.noteFromString_61zpoe$(name);
    var note = tmp$.component1()
    , rest = tmp$.component2();
    if (note == null || !equals(rest, ''))
      throw new NoteException(void 0, void 0, name, 'Strict cast failed');
    return note;
  };
  Note$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Note$Companion_instance = null;
  function Note$Companion_getInstance() {
    if (Note$Companion_instance === null) {
      new Note$Companion();
    }
    return Note$Companion_instance;
  }
  Note.prototype.transpose_gyj958$ = function (origin, target) {
    if (!equals(origin.mode, target.mode))
      throw new KeyException('Try to transpose from ' + origin.name + ' to ' + target.name);
    else
      return new Note(this.noteId + (target.tonic.noteId - origin.tonic.noteId) | 0, this.natural + (target.tonic.natural - origin.tonic.natural) | 0);
  };
  Note.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Note',
    interfaces: []
  };
  function Note_init(note, $this) {
    $this = $this || Object.create(Note.prototype);
    Note.call($this, note.noteId, note.natural);
    return $this;
  }
  function Note_init_0(name, $this) {
    $this = $this || Object.create(Note.prototype);
    Note_init(Note$Companion_getInstance().noteFromName_61zpoe$(name), $this);
    return $this;
  }
  function PlainTextAPI() {
    PlainTextAPI$Companion_getInstance();
  }
  function PlainTextAPI$Companion() {
    PlainTextAPI$Companion_instance = this;
  }
  PlainTextAPI$Companion.prototype.musicTextFromPlainText_61zpoe$ = function (text) {
    return this.sharpFromGridSymbol_61zpoe$(this.flatFromSmallB_61zpoe$(text));
  };
  PlainTextAPI$Companion.prototype.cyrillicLettersToLatin_61zpoe$ = function (text) {
    var destination = ArrayList_init(text.length);
    var tmp$;
    tmp$ = iterator(text);
    loop_label: while (tmp$.hasNext()) {
      var item = unboxChar(tmp$.next());
      var tmp$_0 = destination.add_11rb$;
      var char = toBoxedChar(item);
      var transform$result;
      transform$break: do {
        switch (unboxChar(char)) {
          case 1040:
            transform$result = toBoxedChar(65);
            break transform$break;
          case 1042:
            transform$result = toBoxedChar(66);
            break transform$break;
          case 1057:
            transform$result = toBoxedChar(67);
            break transform$break;
          case 1045:
            transform$result = toBoxedChar(69);
            break transform$break;
          case 1053:
            transform$result = toBoxedChar(72);
            break transform$break;
          default:
            transform$result = char;
            break transform$break;
        }
      }
       while (false);
      tmp$_0.call(destination, transform$result);
    }
    return joinToString(destination, '');
  };
  PlainTextAPI$Companion.prototype.sharpFromGridSymbol_61zpoe$ = function (text) {
    var destination = ArrayList_init(text.length);
    var tmp$;
    tmp$ = iterator(text);
    while (tmp$.hasNext()) {
      var item = unboxChar(tmp$.next());
      var tmp$_0 = destination.add_11rb$;
      var char = toBoxedChar(item);
      var transform$result;
      if (unboxChar(char) === 35) {
        transform$result = Note$Companion_getInstance().sharp;
      } else {
        transform$result = char;
      }
      tmp$_0.call(destination, transform$result);
    }
    return joinToString(destination, '');
  };
  PlainTextAPI$Companion.prototype.flatFromSmallB_61zpoe$ = function (text) {
    var destination = ArrayList_init(text.length);
    var tmp$;
    tmp$ = iterator(text);
    while (tmp$.hasNext()) {
      var item = unboxChar(tmp$.next());
      var tmp$_0 = destination.add_11rb$;
      var char = toBoxedChar(item);
      var transform$result;
      if (unboxChar(char) === 98) {
        transform$result = Note$Companion_getInstance().flat;
      } else {
        transform$result = char;
      }
      tmp$_0.call(destination, transform$result);
    }
    return joinToString(destination, '');
  };
  PlainTextAPI$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var PlainTextAPI$Companion_instance = null;
  function PlainTextAPI$Companion_getInstance() {
    if (PlainTextAPI$Companion_instance === null) {
      new PlainTextAPI$Companion();
    }
    return PlainTextAPI$Companion_instance;
  }
  PlainTextAPI.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'PlainTextAPI',
    interfaces: []
  };
  function chordFromName_JS(name) {
    return Chord$Companion_getInstance().chordFromName_61zpoe$(name);
  }
  function keyFromName_JS(name) {
    return Key$Companion_getInstance().keyFromName_61zpoe$(name);
  }
  function chordFromString_JS(name) {
    return Chord$Companion_getInstance().chordFromString_61zpoe$(name);
  }
  function keyFromString_JS(name) {
    return Key$Companion_getInstance().keyFromString_61zpoe$(name);
  }
  function transposeChord_JS(chord, originKey, targetKey) {
    return chord.transpose_gyj958$(originKey, targetKey);
  }
  function transposeChordsText_JS(chordsText, originKey, targetKey, reduceSpaces) {
    if (reduceSpaces === void 0)
      reduceSpaces = false;
    return reduceSpaces ? chordsText.transposeReducingSpaces_gyj958$(originKey, targetKey) : chordsText.transpose_gyj958$(originKey, targetKey);
  }
  function musicTextFromPlainText_JS(text) {
    return PlainTextAPI$Companion_getInstance().musicTextFromPlainText_61zpoe$(text);
  }
  function chordsTextFromPlainText_JS(text) {
    return ChordsText$Companion_getInstance().fromPlainText_61zpoe$(text);
  }
  var package$titovtima = _.titovtima || (_.titovtima = {});
  var package$musicTheory = package$titovtima.musicTheory || (package$titovtima.musicTheory = {});
  package$musicTheory.BiMap = BiMap;
  Object.defineProperty(Chord, 'Companion', {
    get: Chord$Companion_getInstance
  });
  package$musicTheory.Chord_init_2g26u1$ = Chord_init;
  package$musicTheory.Chord_init_61zpoe$ = Chord_init_0;
  package$musicTheory.Chord = Chord;
  Object.defineProperty(ChordsText, 'Companion', {
    get: ChordsText$Companion_getInstance
  });
  package$musicTheory.ChordsText_init_61zpoe$ = ChordsText_init;
  package$musicTheory.ChordsText = ChordsText;
  Either.Left = Either$Left;
  Either.Right = Either$Right;
  package$musicTheory.Either = Either;
  package$musicTheory.eitherLeft_eoe559$ = eitherLeft;
  package$musicTheory.eitherRight_eoe559$ = eitherRight;
  package$musicTheory.NoteException = NoteException;
  package$musicTheory.ChordException = ChordException;
  package$musicTheory.KeyException = KeyException;
  Object.defineProperty(Key, 'Companion', {
    get: Key$Companion_getInstance
  });
  package$musicTheory.Key_init_tmx3tw$ = Key_init;
  package$musicTheory.Key_init_61zpoe$ = Key_init_0;
  package$musicTheory.Key = Key;
  Object.defineProperty(Note, 'Companion', {
    get: Note$Companion_getInstance
  });
  package$musicTheory.Note_init_4o0j9x$ = Note_init;
  package$musicTheory.Note_init_61zpoe$ = Note_init_0;
  package$musicTheory.Note = Note;
  Object.defineProperty(PlainTextAPI, 'Companion', {
    get: PlainTextAPI$Companion_getInstance
  });
  package$musicTheory.PlainTextAPI = PlainTextAPI;
  _.chordFromName = chordFromName_JS;
  _.keyFromName = keyFromName_JS;
  _.chordFromString = chordFromString_JS;
  _.keyFromString = keyFromString_JS;
  _.transposeChord = transposeChord_JS;
  _.transposeChordsText = transposeChordsText_JS;
  _.musicTextFromPlainText = musicTextFromPlainText_JS;
  _.chordsTextFromPlainText = chordsTextFromPlainText_JS;
  Kotlin.defineModule('MusicTheory', _);
  return _;
}(typeof MusicTheory === 'undefined' ? {} : MusicTheory, kotlin);

//# sourceMappingURL=MusicTheory.js.map
