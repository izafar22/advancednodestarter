avoidDuplicate<Tp>(
    items: FormArray,
    propRetriver: (control: AbstractControl) => Tp
  ) {
    return (control: AbstractControl) => {
      items.controls
        .map(x => x['controls'])
        .forEach(element => {
          if (
            items.controls
              .map(a => propRetriver(a))
              .filter(a => a === element['loanType'].value).length === 1
          ) {
            element['loanType'].setErrors(null);
          }
        });

      return control.value &&
        items.controls
          .map(a => propRetriver(a))
          .filter(a => a === control.value).length > 1
        ? {
            duplicateItem: 'duplicate items'
          }
        : null;
    };
  }