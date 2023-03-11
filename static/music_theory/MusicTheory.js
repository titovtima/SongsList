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
  var contains = Kotlin.kotlin.text.contains_sgbm27$;
  var repeat = Kotlin.kotlin.text.repeat_94bcnn$;
  var unboxChar = Kotlin.unboxChar;
  var drop = Kotlin.kotlin.text.drop_6ic1pp$;
  var plus = Kotlin.kotlin.collections.plus_qloxvw$;
  var last = Kotlin.kotlin.collections.last_2p1efm$;
  var dropLast = Kotlin.kotlin.collections.dropLast_yzln2o$;
  var toBoxedChar = Kotlin.toBoxedChar;
  var collectionSizeOrDefault = Kotlin.kotlin.collections.collectionSizeOrDefault_ba2ldo$;
  var ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_ww73n8$;
  var UnsupportedOperationException_init = Kotlin.kotlin.UnsupportedOperationException_init_pdl1vj$;
  var get_indices = Kotlin.kotlin.text.get_indices_gw00vp$;
  var JsMath = Math;
  var emptyList = Kotlin.kotlin.collections.emptyList_287e2$;
  var toString = Kotlin.toString;
  var Exception_init = Kotlin.kotlin.Exception_init_pdl1vj$;
  var Exception = Kotlin.kotlin.Exception;
  var mapOf = Kotlin.kotlin.collections.mapOf_qfcya0$;
  var Enum = Kotlin.kotlin.Enum;
  var throwISE = Kotlin.throwISE;
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
  IntervalException.prototype = Object.create(Exception.prototype);
  IntervalException.prototype.constructor = IntervalException;
  NotationSystem.prototype = Object.create(Enum.prototype);
  NotationSystem.prototype.constructor = NotationSystem;
  NoteWithOctave.prototype = Object.create(Note.prototype);
  NoteWithOctave.prototype.constructor = NoteWithOctave;
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
  }
  Chord.prototype.name_548ocs$ = function (notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    return this.note.name_548ocs$(notationSystem) + this.type;
  };
  function Chord$Companion() {
    Chord$Companion_instance = this;
    this.chordTypes = listOf(['', 'm', '7', 'm7', 'maj7', 'mmaj7', 'dim', 'sus4', 'sus2', 'dim7', '+5', '\xF8']);
  }
  function Chord$Companion$chordFromString$lambda(it) {
    return it.length;
  }
  Chord$Companion.prototype.chordFromString_2zf50e$ = function (name, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$ = Note$Companion_getInstance().noteFromString_2zf50e$(name, notationSystem);
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
  Chord$Companion.prototype.chordFromName_2zf50e$ = function (name, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$ = this.chordFromString_2zf50e$(name, notationSystem);
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
  function Chord_init_0(name, notationSystem, $this) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    $this = $this || Object.create(Chord.prototype);
    Chord_init(Chord$Companion_getInstance().chordFromName_2zf50e$(name, notationSystem), $this);
    return $this;
  }
  function ChordsText(list, notationSystem) {
    ChordsText$Companion_getInstance();
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    this.list = list;
    this.notationSystem_woigta$_0 = notationSystem;
  }
  Object.defineProperty(ChordsText.prototype, 'notationSystem', {
    configurable: true,
    get: function () {
      return this.notationSystem_woigta$_0;
    },
    set: function (notationSystem) {
      this.notationSystem_woigta$_0 = notationSystem;
    }
  });
  function ChordsText$Companion() {
    ChordsText$Companion_instance = this;
  }
  ChordsText$Companion.prototype.fromPlainText_2zf50e$ = function (text, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    return ChordsText_init(PlainTextAPI$Companion_getInstance().musicTextFromPlainText_61zpoe$(text), notationSystem);
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
        transform$result = item.value.name_548ocs$(this.notationSystem);
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
    return new ChordsText(destination, this.notationSystem);
  };
  ChordsText.prototype.reduceSpaces_0 = function (string, needSpaces) {
    var tmp$;
    if (contains(string, 10)) {
      return to(string, 0);
    }
    if (needSpaces === 0)
      tmp$ = to(string, 0);
    else if (needSpaces > 0)
      tmp$ = string.charCodeAt(0) !== 32 ? to(string, needSpaces) : to(repeat(' ', needSpaces) + string, 0);
    else {
      var indexOfFirst$result;
      indexOfFirst$break: do {
        var tmp$_0, tmp$_0_0, tmp$_1, tmp$_2;
        tmp$_0 = get_indices(string);
        tmp$_0_0 = tmp$_0.first;
        tmp$_1 = tmp$_0.last;
        tmp$_2 = tmp$_0.step;
        for (var index = tmp$_0_0; index <= tmp$_1; index += tmp$_2) {
          if (unboxChar(toBoxedChar(string.charCodeAt(index))) !== 32) {
            indexOfFirst$result = index;
            break indexOfFirst$break;
          }
        }
        indexOfFirst$result = -1;
      }
       while (false);
      var haveSpaces = indexOfFirst$result;
      if (haveSpaces === -1)
        haveSpaces = string.length;
      haveSpaces = haveSpaces - 1 | 0;
      var a = haveSpaces;
      var b = -needSpaces | 0;
      var b_0 = JsMath.min(a, b);
      haveSpaces = JsMath.max(0, b_0);
      tmp$ = to(drop(string, haveSpaces), needSpaces + haveSpaces | 0);
    }
    return tmp$;
  };
  ChordsText.prototype.transposeReducingSpaces_gyj958$ = function (origin, target) {
    var needSpaces = {v: 0};
    var $receiver = this.list;
    var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
    var tmp$;
    tmp$ = $receiver.iterator();
    while (tmp$.hasNext()) {
      var item = tmp$.next();
      var tmp$_0 = destination.add_11rb$;
      var transform$result;
      if (Kotlin.isType(item, Either$Left)) {
        var newChord = item.value.transpose_gyj958$(origin, target);
        needSpaces.v = needSpaces.v + (item.value.name_548ocs$(this.notationSystem).length - newChord.name_548ocs$(this.notationSystem).length) | 0;
        transform$result = eitherLeft(newChord);
      } else if (Kotlin.isType(item, Either$Right)) {
        var reduced = this.reduceSpaces_0(item.value, needSpaces.v);
        needSpaces.v = reduced.second;
        transform$result = eitherRight(reduced.first);
      } else {
        transform$result = Kotlin.noWhenBranchMatched();
      }
      tmp$_0.call(destination, transform$result);
    }
    return new ChordsText(destination, this.notationSystem);
  };
  ChordsText.prototype.changeNotation_xv89oz$ = function (newNotation, reduceSpaces) {
    if (reduceSpaces === void 0)
      reduceSpaces = false;
    if (newNotation === this.notationSystem)
      return;
    if (reduceSpaces) {
      var needSpaces = {v: 0};
      var tmp$;
      tmp$ = this.list.iterator();
      while (tmp$.hasNext()) {
        var element = tmp$.next();
        if (Kotlin.isType(element, Either$Left))
          needSpaces.v = needSpaces.v + (element.value.name_548ocs$(this.notationSystem).length - element.value.name_548ocs$(newNotation).length) | 0;
        else if (Kotlin.isType(element, Either$Right)) {
          var reduced = this.reduceSpaces_0(element.value, needSpaces.v);
          needSpaces.v = reduced.second;
          eitherRight(reduced.first);
        } else
          Kotlin.noWhenBranchMatched();
      }
    }
    this.notationSystem = newNotation;
  };
  ChordsText.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ChordsText',
    interfaces: []
  };
  function ChordsText_init(text, notationSystem, $this) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    $this = $this || Object.create(ChordsText.prototype);
    ChordsText$Companion_getInstance();
    var tmp$;
    var restText = text;
    var resultList = emptyList();
    while (restText.length > 0) {
      var tmp$_0 = Chord$Companion_getInstance().chordFromString_2zf50e$(restText, notationSystem);
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
    ChordsText.call($this, resultList, notationSystem);
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
    Exception_init('Exception: note ' + toString(note != null ? note.name_548ocs$() : null) + ', type ' + toString(type) + ', chord name ' + toString(chordName) + ', message: ' + toString(message), this);
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
  function IntervalException(lowNote, highNote, message) {
    if (lowNote === void 0)
      lowNote = null;
    if (highNote === void 0)
      highNote = null;
    if (message === void 0)
      message = null;
    Exception_init('Exception: lowNote (noteId: ' + toString(lowNote != null ? lowNote.noteId : null) + ', natural: ' + toString(lowNote != null ? lowNote.natural : null) + '), ' + ('highNote (noteId: ' + toString(highNote != null ? highNote.noteId : null) + ', natural: ' + toString(highNote != null ? highNote.natural : null) + '), message: ' + toString(message)), this);
    this.lowNote = lowNote;
    this.highNote = highNote;
    this.name = 'IntervalException';
  }
  IntervalException.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'IntervalException',
    interfaces: [Exception]
  };
  function Interval(lowNote, highNote) {
    Interval$Companion_getInstance();
    this.lowNote = lowNote;
    this.highNote = highNote;
    this.name_ru = null;
    var tmp$;
    if (this.lowNote.natural > this.highNote.natural || this.lowNote.noteId > this.highNote.noteId)
      throw new IntervalException(this.lowNote, this.highNote);
    if ((this.highNote.natural - this.lowNote.natural | 0) > 7 || (this.highNote.noteId - this.lowNote.noteId | 0) > 12)
      throw new IntervalException(this.lowNote, this.highNote, 'Interval is too wide');
    var pair = to(this.highNote.natural - this.lowNote.natural | 0, this.highNote.noteId - this.lowNote.noteId | 0);
    tmp$ = Interval$Companion_getInstance().possibleIntervals.get_11rb$(pair);
    if (tmp$ == null) {
      throw new IntervalException(this.lowNote, this.highNote, 'No matching interval');
    }
    this.name_ru = tmp$;
  }
  function Interval$Companion() {
    Interval$Companion_instance = this;
    this.possibleIntervals = new BiMap(mapOf([to(to(0, 0), '\u043F\u0440\u0438\u043C\u0430'), to(to(1, 1), '\u043C\u0430\u043B\u0430\u044F \u0441\u0435\u043A\u0443\u043D\u0434\u0430'), to(to(1, 2), '\u0431\u043E\u043B\u044C\u0448\u0430\u044F \u0441\u0435\u043A\u0443\u043D\u0434\u0430'), to(to(1, 3), '\u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u043D\u0430\u044F \u0441\u0435\u043A\u0443\u043D\u0434\u0430'), to(to(2, 3), '\u043C\u0430\u043B\u0430\u044F \u0442\u0435\u0440\u0446\u0438\u044F'), to(to(2, 4), '\u0431\u043E\u043B\u044C\u0448\u0430\u044F \u0442\u0435\u0440\u0446\u0438\u044F'), to(to(3, 4), '\u0443\u043C\u0435\u043D\u044C\u0448\u0435\u043D\u043D\u0430\u044F \u043A\u0432\u0430\u0440\u0442\u0430'), to(to(3, 5), '\u0447\u0438\u0441\u0442\u0430\u044F \u043A\u0432\u0430\u0440\u0442\u0430'), to(to(3, 6), '\u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u043D\u0430\u044F \u043A\u0432\u0430\u0440\u0442\u0430'), to(to(4, 6), '\u0443\u043C\u0435\u043D\u044C\u0448\u0435\u043D\u043D\u0430\u044F \u043A\u0432\u0438\u043D\u0442\u0430'), to(to(4, 7), '\u0447\u0438\u0441\u0442\u0430\u044F \u043A\u0432\u0438\u043D\u0442\u0430'), to(to(4, 8), '\u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u043D\u0430\u044F \u043A\u0432\u0438\u043D\u0442\u0430'), to(to(5, 8), '\u043C\u0430\u043B\u0430\u044F \u0441\u0435\u043A\u0441\u0442\u0430'), to(to(5, 9), '\u0431\u043E\u043B\u044C\u0448\u0430\u044F \u0441\u0435\u043A\u0441\u0442\u0430'), to(to(6, 9), '\u0443\u043C\u0435\u043D\u044C\u0448\u0435\u043D\u043D\u0430\u044F \u0441\u0435\u043F\u0442\u0438\u043C\u0430'), to(to(6, 10), '\u043C\u0430\u043B\u0430\u044F \u0441\u0435\u043F\u0442\u0438\u043C\u0430'), to(to(6, 11), '\u0431\u043E\u043B\u044C\u0448\u0430\u044F \u0441\u0435\u043F\u0442\u0438\u043C\u0430'), to(to(7, 12), '\u043E\u043A\u0442\u0430\u0432\u0430')]));
  }
  Interval$Companion.prototype.makeIntervalWithSwapNotesIfNeeded_byhmno$ = function (firstNote, secondNote) {
    return firstNote.natural > secondNote.natural ? new Interval(secondNote, firstNote) : new Interval(firstNote, secondNote);
  };
  Interval$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Interval$Companion_instance = null;
  function Interval$Companion_getInstance() {
    if (Interval$Companion_instance === null) {
      new Interval$Companion();
    }
    return Interval$Companion_instance;
  }
  Interval.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Interval',
    interfaces: []
  };
  function Interval_init(lowNote, naturalsDiff, noteIdsDiff, $this) {
    $this = $this || Object.create(Interval.prototype);
    Interval.call($this, lowNote, new NoteWithOctave(lowNote.noteId + noteIdsDiff | 0, lowNote.natural + naturalsDiff | 0));
    return $this;
  }
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
  }
  Key.prototype.name_548ocs$ = function (notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    return this.tonic.name_548ocs$(notationSystem) + this.mode;
  };
  function Key$Companion() {
    Key$Companion_instance = this;
    this.modes = listOf(['', 'm']);
  }
  function Key$Companion$keyFromString$lambda(it) {
    return it.length;
  }
  Key$Companion.prototype.keyFromString_2zf50e$ = function (name, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$ = Note$Companion_getInstance().noteFromString_2zf50e$(name, notationSystem);
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
  Key$Companion.prototype.keyFromName_2zf50e$ = function (name, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$ = this.keyFromString_2zf50e$(name, notationSystem);
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
  function Key_init_0(name, notationSystem, $this) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    $this = $this || Object.create(Key.prototype);
    Key_init(Key$Companion_getInstance().keyFromName_2zf50e$(name, notationSystem), $this);
    return $this;
  }
  function NotationSystem(name, ordinal, notation) {
    Enum.call(this);
    this.notation = notation;
    this.name$ = name;
    this.ordinal$ = ordinal;
  }
  function NotationSystem_initFields() {
    NotationSystem_initFields = function () {
    };
    NotationSystem$English_instance = new NotationSystem('English', 0, 'English');
    NotationSystem$German_instance = new NotationSystem('German', 1, 'German');
  }
  var NotationSystem$English_instance;
  function NotationSystem$English_getInstance() {
    NotationSystem_initFields();
    return NotationSystem$English_instance;
  }
  var NotationSystem$German_instance;
  function NotationSystem$German_getInstance() {
    NotationSystem_initFields();
    return NotationSystem$German_instance;
  }
  NotationSystem.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NotationSystem',
    interfaces: [Enum]
  };
  function NotationSystem$values() {
    return [NotationSystem$English_getInstance(), NotationSystem$German_getInstance()];
  }
  NotationSystem.values = NotationSystem$values;
  function NotationSystem$valueOf(name) {
    switch (name) {
      case 'English':
        return NotationSystem$English_getInstance();
      case 'German':
        return NotationSystem$German_getInstance();
      default:
        throwISE('No enum constant titovtima.musicTheory.NotationSystem.' + name);
    }
  }
  NotationSystem.valueOf_61zpoe$ = NotationSystem$valueOf;
  var defaultNotation;
  function notationFromString(string) {
    switch (string) {
      case 'English':
        return NotationSystem$English_getInstance();
      case 'German':
        return NotationSystem$German_getInstance();
      default:
        return null;
    }
  }
  function notationFromStringOrDefault(string) {
    var tmp$;
    return (tmp$ = notationFromString(string)) != null ? tmp$ : defaultNotation;
  }
  function Note(noteId, natural) {
    Note$Companion_getInstance();
    this.noteId_14pdt8$_0 = (noteId + 1200 | 0) % 12 | 0;
    this.natural_r6judy$_0 = (natural + 700 | 0) % 7 | 0;
  }
  Object.defineProperty(Note.prototype, 'noteId', {
    configurable: true,
    get: function () {
      return this.noteId_14pdt8$_0;
    }
  });
  Object.defineProperty(Note.prototype, 'natural', {
    configurable: true,
    get: function () {
      return this.natural_r6judy$_0;
    }
  });
  Note.prototype.name_548ocs$ = function (notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$;
    tmp$ = Note$Companion_getInstance().nameFromId_w6nr7w$(this.noteId, this.natural, notationSystem);
    if (tmp$ == null) {
      throw new NoteException(this.noteId, this.natural);
    }
    return tmp$;
  };
  function Note$Companion() {
    Note$Companion_instance = this;
    this.sharp = toBoxedChar(9839);
    this.flat = toBoxedChar(9837);
    this.doubleSharp = '\uE000';
    this.doubleFlat = '\uE001';
    this.naturalToId = new BiMap(mapOf([to(0, 0), to(1, 2), to(2, 4), to(3, 5), to(4, 7), to(5, 9), to(6, 11)]));
  }
  Note$Companion.prototype.naturalToName_548ocs$ = function (notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    switch (notationSystem.name) {
      case 'English':
        return new BiMap(mapOf([to(0, toBoxedChar(67)), to(1, toBoxedChar(68)), to(2, toBoxedChar(69)), to(3, toBoxedChar(70)), to(4, toBoxedChar(71)), to(5, toBoxedChar(65)), to(6, toBoxedChar(66))]));
      case 'German':
        return new BiMap(mapOf([to(0, toBoxedChar(67)), to(1, toBoxedChar(68)), to(2, toBoxedChar(69)), to(3, toBoxedChar(70)), to(4, toBoxedChar(71)), to(5, toBoxedChar(65)), to(6, toBoxedChar(72))]));
      default:
        return Kotlin.noWhenBranchMatched();
    }
  };
  Note$Companion.prototype.nameFromId_w6nr7w$ = function (noteId, natural, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$, tmp$_0, tmp$_1;
    if (notationSystem === NotationSystem$German_getInstance() && noteId === 10 && natural === 6)
      return 'B';
    tmp$ = unboxChar(this.naturalToName_548ocs$(notationSystem).get_11rb$(natural));
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
  Note$Companion.prototype.noteFromString_2zf50e$ = function (name, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$, tmp$_0, tmp$_1;
    if (name.length === 0)
      return to(null, name);
    var naturalChar = name.charCodeAt(0);
    if (notationSystem === NotationSystem$German_getInstance() && naturalChar === 66) {
      return to(new Note(10, 6), name.substring(1));
    }
    tmp$ = this.naturalToName_548ocs$(notationSystem).reverse.get_11rb$(toBoxedChar(naturalChar));
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
  Note$Companion.prototype.noteFromName_2zf50e$ = function (name, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    var tmp$ = this.noteFromString_2zf50e$(name, notationSystem);
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
      throw new KeyException('Try to transpose from ' + origin.name_548ocs$() + ' to ' + target.name_548ocs$());
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
  function Note_init_0(name, notationSystem, $this) {
    if (notationSystem === void 0)
      notationSystem = defaultNotation;
    $this = $this || Object.create(Note.prototype);
    Note_init(Note$Companion_getInstance().noteFromName_2zf50e$(name, notationSystem), $this);
    return $this;
  }
  function NoteWithOctave(noteId, natural) {
    Note.call(this, noteId, natural);
    this.noteId_p01qgm$_0 = noteId;
    this.natural_e61v78$_0 = natural;
    this.octave = 0;
    if (this.noteId < 0 || this.natural < 0)
      throw new NoteException(this.noteId, this.natural, void 0, 'Try to create note in octave');
    var octaveByNatural = this.natural % 7 | 0;
    var octaveByNoteId = this.noteId % 12 | 0;
    this.octave = octaveByNatural === octaveByNoteId ? octaveByNatural : 4;
  }
  Object.defineProperty(NoteWithOctave.prototype, 'noteId', {
    get: function () {
      return this.noteId_p01qgm$_0;
    }
  });
  Object.defineProperty(NoteWithOctave.prototype, 'natural', {
    get: function () {
      return this.natural_e61v78$_0;
    }
  });
  NoteWithOctave.prototype.noteWithoutOctave = function () {
    return Note_init(this);
  };
  NoteWithOctave.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'NoteWithOctave',
    interfaces: [Note]
  };
  function NoteWithOctave_init(note, octave, $this) {
    if (octave === void 0)
      octave = 4;
    $this = $this || Object.create(NoteWithOctave.prototype);
    NoteWithOctave.call($this, note.noteId + (octave * 12 | 0) | 0, note.natural + (octave * 7 | 0) | 0);
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
  function chordFromName_JS(name, notationSystem) {
    return Chord$Companion_getInstance().chordFromName_2zf50e$(name, notationFromStringOrDefault(notationSystem));
  }
  function keyFromName_JS(name, notationSystem) {
    return Key$Companion_getInstance().keyFromName_2zf50e$(name, notationFromStringOrDefault(notationSystem));
  }
  function chordFromString_JS(name, notationSystem) {
    return Chord$Companion_getInstance().chordFromString_2zf50e$(name, notationFromStringOrDefault(notationSystem));
  }
  function keyFromString_JS(name, notationSystem) {
    return Key$Companion_getInstance().keyFromString_2zf50e$(name, notationFromStringOrDefault(notationSystem));
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
  function chordsTextFromPlainText_JS(text, notationSystem) {
    return ChordsText$Companion_getInstance().fromPlainText_2zf50e$(text, notationFromStringOrDefault(notationSystem));
  }
  function changeChordsTextNotation_JS(chordsText, newNotation, reduceSpaces) {
    if (reduceSpaces === void 0)
      reduceSpaces = false;
    chordsText.changeNotation_xv89oz$(notationFromStringOrDefault(newNotation), reduceSpaces);
  }
  function noteName_JS(note, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = 'English';
    return note.name_548ocs$(notationFromStringOrDefault(notationSystem));
  }
  function chordName_JS(chord, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = 'English';
    return chord.name_548ocs$(notationFromStringOrDefault(notationSystem));
  }
  function keyName_JS(key, notationSystem) {
    if (notationSystem === void 0)
      notationSystem = 'English';
    return key.name_548ocs$(notationFromStringOrDefault(notationSystem));
  }
  function chordsTextToString_JS(chordsText) {
    return chordsText.toString();
  }
  function getIntervalNameByDifferenceNumbers_JS(naturalsDiff, noteIdsDiff) {
    return Interval$Companion_getInstance().possibleIntervals.get_11rb$(to(naturalsDiff, noteIdsDiff));
  }
  function getDifferenceNumbersByIntervalName_JS(intervalName) {
    var pair = Interval$Companion_getInstance().possibleIntervals.reverse.get_11rb$(intervalName);
    return [pair != null ? pair.first : null, pair != null ? pair.second : null];
  }
  function createNoteWithOctave_JS(noteId, natural) {
    return new NoteWithOctave(noteId, natural);
  }
  function createIntervalByNoteAndDiffs_JS(startNote, naturalsDiff, noteIdsDiff) {
    return Interval_init(startNote, naturalsDiff, noteIdsDiff);
  }
  var package$titovtima = _.titovtima || (_.titovtima = {});
  var package$musicTheory = package$titovtima.musicTheory || (package$titovtima.musicTheory = {});
  package$musicTheory.BiMap = BiMap;
  Object.defineProperty(Chord, 'Companion', {
    get: Chord$Companion_getInstance
  });
  package$musicTheory.Chord_init_2g26u1$ = Chord_init;
  package$musicTheory.Chord_init_2zf50e$ = Chord_init_0;
  package$musicTheory.Chord = Chord;
  Object.defineProperty(ChordsText, 'Companion', {
    get: ChordsText$Companion_getInstance
  });
  package$musicTheory.ChordsText_init_2zf50e$ = ChordsText_init;
  package$musicTheory.ChordsText = ChordsText;
  Either.Left = Either$Left;
  Either.Right = Either$Right;
  package$musicTheory.Either = Either;
  package$musicTheory.eitherLeft_eoe559$ = eitherLeft;
  package$musicTheory.eitherRight_eoe559$ = eitherRight;
  package$musicTheory.NoteException = NoteException;
  package$musicTheory.ChordException = ChordException;
  package$musicTheory.KeyException = KeyException;
  package$musicTheory.IntervalException = IntervalException;
  Object.defineProperty(Interval, 'Companion', {
    get: Interval$Companion_getInstance
  });
  package$musicTheory.Interval_init_x3k1aj$ = Interval_init;
  package$musicTheory.Interval = Interval;
  Object.defineProperty(Key, 'Companion', {
    get: Key$Companion_getInstance
  });
  package$musicTheory.Key_init_tmx3tw$ = Key_init;
  package$musicTheory.Key_init_2zf50e$ = Key_init_0;
  package$musicTheory.Key = Key;
  Object.defineProperty(NotationSystem, 'English', {
    get: NotationSystem$English_getInstance
  });
  Object.defineProperty(NotationSystem, 'German', {
    get: NotationSystem$German_getInstance
  });
  package$musicTheory.NotationSystem = NotationSystem;
  Object.defineProperty(package$musicTheory, 'defaultNotation', {
    get: function () {
      return defaultNotation;
    }
  });
  package$musicTheory.notationFromString_61zpoe$ = notationFromString;
  package$musicTheory.notationFromStringOrDefault_61zpoe$ = notationFromStringOrDefault;
  Object.defineProperty(Note, 'Companion', {
    get: Note$Companion_getInstance
  });
  package$musicTheory.Note_init_4o0j9x$ = Note_init;
  package$musicTheory.Note_init_2zf50e$ = Note_init_0;
  package$musicTheory.Note = Note;
  package$musicTheory.NoteWithOctave_init_t7qrq1$ = NoteWithOctave_init;
  package$musicTheory.NoteWithOctave = NoteWithOctave;
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
  _.changeChordsTextNotation = changeChordsTextNotation_JS;
  _.noteName = noteName_JS;
  _.chordName = chordName_JS;
  _.keyName = keyName_JS;
  _.chordsTextToString = chordsTextToString_JS;
  _.getIntervalNameByDifferenceNumbers = getIntervalNameByDifferenceNumbers_JS;
  _.getDifferenceNumbersByIntervalName = getDifferenceNumbersByIntervalName_JS;
  _.createNoteWithOctave = createNoteWithOctave_JS;
  _.createIntervalByNoteAndDiffs = createIntervalByNoteAndDiffs_JS;
  defaultNotation = NotationSystem$English_getInstance();
  Kotlin.defineModule('MusicTheory', _);
  return _;
}(typeof MusicTheory === 'undefined' ? {} : MusicTheory, kotlin);

//# sourceMappingURL=MusicTheory.js.map
