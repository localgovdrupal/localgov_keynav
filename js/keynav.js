/**
 * @file JS file for the keynav module.
 */

(function keyNavScript(Drupal, drupalSettings) {
  Drupal.behaviors.keyNav = {
    attach: function (context) {
      let keySequence = ''; // Initialize variable to store key presses
      const modulePath = drupalSettings.localgovKeyNav.modulePath;

      // Use the modulePath to construct the URL to the JSON file
      const sequences = fetch(`${window.location.origin}/${modulePath}/js/keynav-sequences.json`).then((response) => {
        return response.json();
      });

      const focusableElementsArray = Array.from(document.querySelectorAll('input:not([disabled])', 'textarea:not([disabled])', '[contenteditable]'));
      const ckeditors = document.querySelectorAll('.form-textarea-wrapper');
      const toolbarLinks = document.querySelectorAll('.toolbar-menu-administration > .toolbar-menu > li > a');

      // Access custom keynav configuration item for any sites that have added
      // custom patterns.
      let customKeynavPatterns = [];
      const customKeynavPatternsFromConfig = drupalSettings.localgovKeyNav.customKeynavPatterns;
      if (customKeynavPatternsFromConfig) {
        customKeynavPatternsFromConfig.split('\r\n').forEach((pattern) => {
          customKeynavPatterns.push(pattern);
        });
      }

      function handleToolbarItems(link) {
          window.location.href = link.href;
          keySequence = '';
      }

      // Define a named event listener function for keyup events.
      function handleKeyup(event) {
        // Add the pressed key to the sequence.
        keySequence += event.key.toLowerCase();

        // If the esc key is pressed, reset the key sequence.
        if (event.key === "Escape") {
          keySequence = '';
        }

        // Don't do anything until the enter key is pressed.
        if (event.key === "Enter") {
          // We don't want 'enter' at the end of the sequence, or else we'll have
          // a sequence like lgdasenter which won't match anything.
          keySequence = keySequence.replace('enter', '');

          // Check if the sequence starts with 'lgd'
          if (keySequence.startsWith('lgd')) {

            // For each sequence in the JSON file, check if the current sequence matches
            sequences.then((data) => {
              data.forEach((sequence) => {
                if (keySequence === 'lgd' + sequence.keynavSequence) {
                    window.location.href = sequence.url;
                    keySequence = '';
                }
              });
            });

            // Foreach item in toolbarlinks, check if the current sequence matches
            // that items index
            // This is for top level toolbar items.
            toolbarLinks.forEach((topLevelItem, topLevelItemIndex) => {
               if (keySequence === `lgdt${(topLevelItemIndex + 1)}`) {
                handleToolbarItems(topLevelItem);
              }
              // This is for second level toolbar items.
              // For exmaple, admin > structure > content types
              // It follows the format lgdt2.3 (3rd submenu item of the second toolbar item)
              const hasLevel1Items = topLevelItem.closest('li').querySelector('.toolbar-menu');
              if (hasLevel1Items) {
                const toolbarLinksLevel1ItemsLi = Array.from(hasLevel1Items.children);
                const toolbarLinksLevel1Items = [];
                toolbarLinksLevel1ItemsLi.forEach((li) => {
                  toolbarLinksLevel1Items.push(li.querySelector('a'));
                });
                toolbarLinksLevel1Items.forEach((levelOneItem, levelOneItemIndex) => {
                   if (keySequence === `lgdt${(topLevelItemIndex + 1)}.${(levelOneItemIndex)}`) {
                    handleToolbarItems(levelOneItem);
                  }
                  // This is for third level toolbar items.
                  // For example, admin > structure > content types > add content type
                  // It follows the format lgdt2.3.1 (1st submenu item of the 3rd submenu item of the second toolbar item)
                  const hasLevel2Items = levelOneItem.closest('li').querySelector('.toolbar-menu');
                  if (hasLevel2Items) {
                    const toolbarLinksLevel2ItemsLi = Array.from(hasLevel2Items.children);
                    const toolbarLinksLevel2Items = [];
                    toolbarLinksLevel2ItemsLi.forEach((li) => {
                      toolbarLinksLevel2Items.push(li.querySelector('a'));
                    });
                    toolbarLinksLevel2Items.forEach((levelTwoItem, levelTwoItemIndex) => {
                       if (keySequence === `lgdt${(topLevelItemIndex + 1)}.${(levelOneItemIndex)}.${(levelTwoItemIndex)}`) {
                        handleToolbarItems(levelTwoItem);
                      }
                      // This is for fourth level toolbar items.
                      // For example, admin > structure > content types > news > manage fields
                      // It follows the format lgdt2.3.1.1 (1st submenu item of the 4th submenu item of the 3rd submenu item of the second toolbar item)
                      const hasLevel3Items = levelTwoItem.closest('li').querySelector('.toolbar-menu');
                      if (hasLevel3Items) {
                        const toolbarLinksLevel3ItemsLi = Array.from(hasLevel3Items.children);
                        const toolbarLinksLevel3Items = [];
                        toolbarLinksLevel3ItemsLi.forEach((li) => {
                          toolbarLinksLevel3Items.push(li.querySelector('a'));
                        });
                        toolbarLinksLevel3Items.forEach((levelThreeItem, levelThreeItemIndex) => {
                           if (keySequence === `lgdt${(topLevelItemIndex + 1)}.${(levelOneItemIndex)}.${(levelTwoItemIndex)}.${(levelThreeItemIndex)}`) {
                            handleToolbarItems(levelThreeItem);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
            if (customKeynavPatterns.length > 0) {
              customKeynavPatterns.forEach((pattern) => {
                const splitPattern = pattern.split('|');
                const key = splitPattern[0];
                const value = splitPattern[1];
                if (keySequence === `lgd${key}`) {
                  window.location.href = `/${value}`;
                  keySequence = '';
                }
              });
            }

          } else if (!'lgd'.startsWith(keySequence)) {
            // If the current sequence cannot possibly match 'lgd', reset it
            keySequence = '';
          }
        }

      }

      // Add the event listener to the document.
      document.addEventListener('keyup', handleKeyup);

      // Add event listeners to focusable elements to prevent keynav from
      // interfering with typing
      focusableElementsArray.forEach((element) => {
        element.addEventListener('focus', function () {
          document.removeEventListener('keyup', handleKeyup);
          keySequence = '';
        });

        // Add event listener to blur event to re-enable keynav
        element.addEventListener('blur', function () {
          document.addEventListener('keyup', handleKeyup);
          keySequence = '';
        });
      });

      // Add event listeners to CKEditor instances to prevent keynav from
      // interfering with typing
      ckeditors.forEach((element) => {
        element.addEventListener('click', function () {
          document.removeEventListener('keyup', handleKeyup);
          keySequence = '';
        });

        // Add event listener to "blur" event to re-enable keynav
        window.addEventListener('click', function (e) {
          if (!(e.target.closest('.form-textarea-wrapper'))) {
            document.addEventListener('keyup', handleKeyup);
            keySequence = '';
          }
        });
      });

    },
  };
})(Drupal, drupalSettings);
