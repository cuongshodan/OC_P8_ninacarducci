(function($) {
  $.fn.mauGallery = function(options) {
    const settings = $.extend({}, $.fn.mauGallery.defaults, options);
    const tagsCollection = [];
    return this.each(function() {
      const $gallery = $(this);
      $.fn.mauGallery.methods.createRowWrapper($gallery);
      if (settings.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $gallery,
          settings.lightboxId,
          settings.navigation
        );
      }
      $.fn.mauGallery.listeners($gallery, settings);

      const $galleryItems = $gallery.children(".gallery-item");
      $galleryItems.each(function() {
        const $item = $(this);
        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.moveItemInRowWrapper($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, settings.columns);
        const theTag = $item.data("gallery-tag");
        if (
          settings.showTags &&
          theTag !== undefined &&
          !tagsCollection.includes(theTag)
        ) {
          tagsCollection.push(theTag);
        }
      });

      if (settings.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $gallery,
          settings.tagsPosition,
          tagsCollection
        );
      }

      $gallery.fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function($gallery, settings) {
    $gallery.on("click", ".gallery-item", function() {
      const $this = $(this);
      if (settings.lightBox && $this.prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($this, settings.lightboxId);
      } else {
        return;
      }
    });

    $gallery.on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $gallery.on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.navigateImage('prev')
    );
    $gallery.on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.navigateImage('next')
    );

    // Navigation au clavier dans la lightbox
    $gallery.on("keydown", ".mg-prev, .mg-next", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        const direction = $(this).hasClass("mg-prev") ? 'prev' : 'next';
        $.fn.mauGallery.methods.navigateImage(direction);
      }
    });
  };

  $.fn.mauGallery.methods = {
    createRowWrapper($element) {
      if (!$element.children().first().hasClass("row")) {
        $element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn($element, columns) {
      if (typeof columns === "number") {
        $element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (typeof columns === "object") {
        let columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        $element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper($element) {
      $element.appendTo(".gallery-items-row");
    },
    responsiveImageItem($element) {
      if ($element.prop("tagName") === "IMG") {
        $element.addClass("img-fluid");
      }
    },
    openLightBox($element, lightboxId) {
      const imgSrc = $element.attr("src");
      const imgAlt = $element.attr("alt");
      const $lightbox = $(`#${lightboxId || 'galleryLightbox'}`);
      $lightbox.find(".lightboxImage")
        .attr("src", imgSrc)
        .attr("alt", imgAlt);
      $lightbox.modal("toggle");
    },
    navigateImage(direction) {
      const activeImageSrc = $(".lightboxImage").attr("src");
      const activeTag = $(".tags-bar .active-tag").data("images-toggle");
      const imagesCollection = [];
      $(".item-column").each(function() {
        const $img = $(this).find("img.gallery-item");
        const imgTag = $img.data("gallery-tag");
        if (activeTag === "all" || imgTag === activeTag) {
          imagesCollection.push($img);
        }
      });
      const currentIndex = imagesCollection.findIndex($img => $img.attr("src") === activeImageSrc);
      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % imagesCollection.length;
      } else {
        newIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
      }
      const $nextImage = imagesCollection[newIndex];
      $(".lightboxImage")
        .attr("src", $nextImage.attr("src"))
        .attr("alt", $nextImage.attr("alt"));
    },
    createLightBox($gallery, lightboxId, navigation) {
      const lightboxHtml = `
        <div class="modal fade" id="${lightboxId || 'galleryLightbox'}" tabindex="-1" role="dialog" aria-hidden="true" aria-modal="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation ? '<button type="button" class="mg-prev" aria-label="Image précédente">&lt;</button>' : ''}
                <img class="lightboxImage img-fluid" alt="Image agrandie"/>
                ${navigation ? '<button type="button" class="mg-next" aria-label="Image suivante">&gt;</button>' : ''}
              </div>
            </div>
          </div>
        </div>`;
      $gallery.append(lightboxHtml);
    },
    showItemTags($gallery, position, tags) {
      let tagItems = `
        <li class="nav-item">
          <span class="nav-link active active-tag" data-images-toggle="all">Tous</span>
        </li>`;
      tags.forEach(value => {
        tagItems += `
          <li class="nav-item">
            <span class="nav-link" data-images-toggle="${value}">${value}</span>
          </li>`;
      });
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (position === "bottom") {
        $gallery.append(tagsRow);
      } else if (position === "top") {
        $gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active.active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active");
      const tag = $(this).data("images-toggle");
      $(".gallery-item").each(function() {
        const $itemColumn = $(this).closest(".item-column");
        $itemColumn.hide();
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          $itemColumn.show(300);
        }
      });
    }
  };
})(jQuery);
