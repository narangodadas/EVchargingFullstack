using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EVChargingStationWeb.Server.Filters
{
    public class DisableModelValidationAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            context.ModelState.Clear();
            base.OnActionExecuting(context);
        }
    }
}