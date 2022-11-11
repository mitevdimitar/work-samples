import React, { useState, useRef, useEffect } from "react";
import {
  EditorState,
  ContentState,
  convertToRaw,
  convertFromHTML,
  Modifier,
} from "draft-js";
import Editor from "draft-js-plugins-editor";
import draftToHtml from "draftjs-to-html";
import RichTextButtons from "./rich_text_buttons";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 210,
    padding: theme.spacing(1),
    border: "1px solid darkgrey",
    borderRadius: 5,
    "&:hover": {
      border: "1px solid #212121",
    },
  },
  editorWrapper: {
    width: "100%",
    height: 150,
  },
  editor: {
    height: 140,
    color: "rgba(0, 0, 0, 0.87)",
    background: "white",
    width: "90%",
  },
  options: {
    height: "100%",
    padding: 5,
    alignItems: "flex-end",
  },
}));

function RichTextEditor({
  placeholder,
  handleReturn,
  value,
  onValueChange,
  emojiPlugin,
  id,
  tokenValue,
}) {
  const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const classes = useStyles();

  useEffect(() => {
    //clear state if there is no value
    const currentState = editorState.getCurrentContent().getPlainText();
    if (currentState && !value) {
      const emptyEditorState = EditorState.push(
        editorState,
        ContentState.createFromText("")
      );
      setEditorState(emptyEditorState);
    }
    //initiate new state
    if (!currentState && value) {
      const blocksFromHTML = convertFromHTML(value);
      if (
        blocksFromHTML.contentBlocks &&
        blocksFromHTML.contentBlocks.length > 0
      ) {
        const state = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap
        );
        onValueChange(value);
        setEditorState(EditorState.createWithContent(state));
      }
    }
  }, [value, editorState, onValueChange]);

  useEffect(() => {
    if (tokenValue) {
      sendTokenToEditor(tokenValue);
    }
    // eslint-disable-next-line
  }, [tokenValue]);

  const sendTokenToEditor = (text) => {
    setEditorState(insertText(text, editorState));
  };

  const insertText = (text, editorValue) => {
    const currentContent = editorValue.getCurrentContent();
    const currentSelection = editorValue.getSelection();

    const newContent = Modifier.replaceText(
      currentContent,
      currentSelection,
      text
    );

    const newEditorState = EditorState.push(
      editorValue,
      newContent,
      "insert-characters"
    );
    return EditorState.forceSelection(
      newEditorState,
      newContent.getSelectionAfter()
    );
  };

  const emojiEditor = useRef(null);

  const focusEditor = () => {
    emojiEditor && emojiEditor.current && emojiEditor.current.focus();
  };

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
    if (onValueChange) {
      const rawContentState = convertToRaw(newEditorState.getCurrentContent());
      const markup = draftToHtml(rawContentState);

      onValueChange(markup);
    }
  };

  return (
    <Grid container className={classes.root}>
      <RichTextButtons onEditorChange={onChange} editorState={editorState} />
      <Grid className={`editor-wrapper ${classes.editorWrapper}`}>
        <Grid className={`editor ${classes.editor}`} onClick={focusEditor}>
          <Editor
            handleReturn={handleReturn}
            id={id}
            editorState={editorState}
            onChange={onChange}
            placeholder={placeholder}
            plugins={[emojiPlugin]}
            ref={(ref) => (emojiEditor.current = ref)}
          />
          <EmojiSuggestions />
        </Grid>
        <Grid className={`options ${classes.options}`}>
          <EmojiSelect />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default RichTextEditor;
